//
// init
//
Session.set("load_time", 50.0); // safety net for load times
Session.set("queue", []);
Session.set("mixer_playing", false);


// private variable
var queuedWaves = [];
var BUFFER_LOAD_SPEED = 1000000; // bytes/sec

//
// /init
//

Mixer = {

  //
  // vars
  //
  'local': true,
  'part': 'http://s3-us-west-2.amazonaws.com/beatfn.com/',
  'audioContext': audioContext,

  //
  // functions
  // 

  'play': function(sample) {
    // access control TODO: move this
    if (Meteor.userId() != Meteor.users.findOne({ username: 'test' })._id) {
      return alert("Sorry, but you cannot stream music unless you're logged into an account that owns it. If you'd like to help test this app, contact wolfbiter@gmail.com.");
    }
    // if given a sample, place it at start of queue
    if (sample) {
      Mixer.queue(sample, 0);
    }
    // update play status
    Session.set("mixer_playing", true);
  },

  'pause': function() {
    Session.set("mixer_playing", false);
  },

  'skip': function() {
    cycleQueue();
  },

  // sifts through the queue to return only samples of type, or everything
  'getQueue': function(type) {
    var queue = Session.get("queue");

    switch (type) {
      case undefined: return queue;
      case 'wave': return queuedWaves;
      default: // filter by given type
      {
        var newQueue = [];
        // inorder traversal
        for (var i = 0; i < queue.length; i++) {
          var sample = queue[i];
          if (sample['type'] === type) {
            newQueue.push(sample);
          }
        }
        return newQueue;
      }
    }
  },
  
  // creates a soft transition object from startSong to endSong
  'makeSoftTransition': function(startSong, endSong) {
    return {
      'type': 'transition',
      'startSong': startSong,
      'endSong': endSong,
      'transitionType': 'soft',
    };
  },

  // adds given sample to the queue
  'queue': function(sample, index, startTime, endTime) {
    if (!sample) {
      return console.log("WARNING: queueSample called without a sample");
    }
    else if (sample.type === 'song') {
      queueSong(sample, index, startTime, endTime);
    }
    else if (sample.type === 'transition') {
      queueTransition(sample, index, startTime, endTime);
    }
  },

  'getSongUrl': function(song) {
    var part = Mixer.part;
    if (Mixer.local) part = "";
    return part + 'songs/' + song.name + '.' + song.fileType;
  },

  'getTransitionUrl': function(transition) {
    var part = Mixer.part;
    if (Mixer.local) part = "";
    return part + 'transitions/' +
      Songs.findOne(transition.startSong).name + '-' +
      Songs.findOne(transition.endSong).name + '.' + transition.fileType;
  },

  // returns a valid transition to song such that the queue
  // retains maximum possible length. 
  // TODO: what if none exist? add a soft transition to the end? or maybe find a path such that one exists?
  // TODO: make this able to take in a queue, but default queue to current queue
  'getNearestValidTransition': function(song) {
    var queue = Mixer.getQueue(),
        transitions = Transitions.find({ endSong: song._id }).fetch();
    for (index = queue.length - 1; index >= -1; index--) {
      for (var i = 0; i < transitions.length; i++) {
        var transition = transitions[i];
        if (isValidTransition(queue[index], transition)) {
          return { 'transition': transition, 'index': ++index };
        }
      }
    }
    return console.log("ERROR: found no valid transitions for: "+song.name);
  }

};

//
// private methods
//

function queueSong(song, index, startTime, endTime) {
  if (index === undefined) index = queue.length;
  // coerce song into id
  var id = song;
  if (typeof id === 'object') {
    id = song._id;
  }

  // if the last sample in the queue is a song,
  // make a soft transition and queue it (implicitly queueing this song)
  var queue = Mixer.getQueue();
  var lastSample = queue[queue.length];
  if ((lastSample && lastSample.type) === 'song') {
    var softTransition = Mixer.makeSoftTransition(lastSample._id, id);
    queueTransition(softTransition, index);

  // otherwise, queue this song
  } else {
    mutateQueue({
      'type': "song",
      '_id': id,
      'startTime': startTime,
      'endTime': endTime
    }, index);
  }
}

// TODO: transition objects need start and end times for themselves too
function queueTransition(transition, index, startTime, endTime) {
  if (index === undefined) index = queue.length;
  // coerce transition into object
  if (typeof transition !== 'object') {
    transition = Transitions.findOne(transition);
  }

  console.log("queueTransition called with below at index: "+index);
  console.log(transition);

  // if queueing transition at front, queue startSong first
  if (index === 0) {
    Mixer.queueSong(transition.startSong, index++, 0, transition.startTime);
  }

  // if transition fits at this index, queue it and endSong
  if (isValidTransition(transition, index)) {
    // set prevSample's endTime
    Mixer.queueSong(transition.endSong, index++, transition.endTime);
    mutateQueue({
      'type': "transition",
      '_id': transition._id,
      'startTime': startTime,
      'endTime': endTime
    }, index++);
    Mixer.queueSong(transition.endSong, index++, transition.endTime);
  } else {
    return console.log("ERROR: Invalid Transition given to queueTransition");
  }
}

// insert sample at index
function mutateQueue(sample, index) {
  var queue = Mixer.getQueue();
  queue.splice(index, queue.length - index, sample);
  Session.set("queue", queue);
}

// algorithm to decide which transition comes next.
function chooseTransition() {
  var currSample_id = Session.get("current_sample");
  var choices = Transitions.find({
    startSong: currSample_id,
    startTime: { $gt: queuedTransitions[0] + Session.get("load_time") }
  }).fetch();

  // find choice with endSong that has least number of plays amongst choices
  var transition = choices[0],
      endSong = (transition && Songs.findOne(transition.endSong)) ||
        Songs.findOne();
  // TODO: make this a slick database query
  for (var i = 0; i < choices.length; i++) {
    var _transition = choices[i];
    var _endSong = Songs.findOne(_transition.endSong);
    if (_endSong.playCount < endSong.playCount) {
      transition = _transition;
      endSong = _endSong;
    }
  }

  // if there is a song with a lower playCount than endSong, soft transition to it
  var song = Songs.findOne({ playCount: { $lt: endSong.playCount } });
  if (song) {
    transition = {
      'startSong': currSample_id,
      'endSong': song._id,
      'startTime': 0,
      'endTime': 0
    };
  }

  console.log("CHOOSING transition: ");
  console.log(transition);

  queueTransition(transition);
}

function isValidTransition(prevSample, transition, debug) {
  if (debug) console.log(transition);

  // if not given a transition, immediate gg
  if (!transition) {
    if (debug) console.log("ERROR: transition undefined");
    return false;
  }

  // if given a prevSample
  if (prevSample) {

    // check to make sure transition fits with prevSample
    if (prevSample._id !== transition.startSong) {
      if (debug) console.log("ERROR: given transition does not fit prevSample");
      return false;
    }

    // if prevSample is the current sample, make sure transition isn't too soon
    if (prevSample._id === Session.get("current_sample")) {
      if (currentPosition() >
        transition.startTime - Session.get("load_time")) {
        if (debug) console.log("ERROR: too far in currSample to queue given transition");
        return false;
      }
    }

    // if prevSample is not the current sample, make sure transition isn't too soon
    else if (prevSample.startTime > transition.startTime - Session.get("load_time")) {
      if (debug) console.log("ERROR: given transition starts too soon after prevSample");
      return false;
    }
  }

  // if we get here, we've passed all our validation checks
  return true;
}

// assert samples are synchronously loaded and played in the order they are cued
function assertQueue() {
  var queue = Mixer.getQueue(),
      queueLength = queue.length;

  // TODO: make it understand what to do while still loading songs and queue is changed.
  //       for example: what to do if song we are currently loading is no longer needed?

  // TODO: should we remove queuedWaves when queue is cut to 0?
  if (queueLength > 0) {

    // find out where our sample queue and wave queue diverge
    // TODO: what if wave queue is longer than sample queue? handle in mutateQueue?
    var index;
    for (index = 0; index <= queueLength; index++) {
      if (queuedWaves[index]._id !== queue[index]._id) {
        break;
      }
    }

    // load the unloaded transitions, if there are any
    if (index < queueLength) {
      return loadSample(index);
    }
  }
}

// synchronously load samples starting from index
function loadSample(index) {
  var queue = Mixer.getQueue(),
      sample = queue[index],
      sampleUrl = getSampleUrl(sample);

  // make and prep wave, then add it to the queue
  makeWave(sampleUrl, function (wave) {
    wave = prepWave(wave, sample);
    queuedWaves[index] = wave;
    // play if we were waiting for load to complete
    assertPlayStatus();

    // if prevWave, schedule this wave to start after it
    var prevWave = queuedWaves[index - 1];
    if (prevWave) {

      // make sure prevWave has end marker
      if (!prevWave.markers.end) {
        prevWave.mark({
          'id': 'end',
          'position': queue[index - 1].endTime
        });
      }
      prevWave.on('mark', function (mark) {
        if (mark.id === 'end') {
          cycleQueue();
        }
      });
    }

    // load next transition if this is not the last
    if (++index < queue.length) {
      loadSample(index);
    }

  });
}

// make wave from url, return new wave to callback
function makeWave(url, callback) {

  // init new wave
  var wave = Object.create(WaveSurfer);
  wave.init({
    'audioContext': Mixer.audioContext
  });

  // load url
  // TODO: make this a progress bar
  wave.load(url);
  wave.on('ready', function () {
    callback(wave);
  });
}

function prepWave(wave, sample) {
  wave._id = sample._id;
  var startTime = sample.startTime || 0;
  wave.skip(startTime);
  // if wave hits end of track, cycle the queue
  wave.mark({
    'id': 'track_end',
    'position': getWaveDuration(wave)
  });
  wave.on('mark', function (mark) {
    if (mark.id === 'track_end') {
      cycleQueue();
    }
  });
}

// NOTE: position is in seconds, progress is in percent
function currentPosition() {
  return (queuedWaves[0] && getWavePosition(queuedWaves[0]));
}

function currentProgress() {
  var wave = queuedWaves[0];
  return (wave &&
    (getWavePosition(wave) / getWaveDuration(wave)));
}

function getWavePosition(wave) {
  return wave.timings()[0];
}

function getWaveDuration(wave) {
  return wave.timings()[1];
}

function cycleQueue() {

  // update wave queue
  pauseWave();
  var newWave = queuedWaves.shift();

  // update sample queue
  var queue = Mixer.getQueue();
  queue.shift();
  Session.set("queue", queue);
  assertPlayStatus();
}

function assertPlayStatus() {
  if (Session.get("mixer_playing")) {
    playWave();
  } else {
    pauseWave();
  }
}

function pauseWave() {
  if (queuedWaves[0]) {
    queuedWaves[0].pause();
  }
}

function playWave() {
  var wave = queuedWaves[0];
  if (wave) {
    wave.play();
    Session.set("current_sample", wave._id);
  } else {
    Session.set("current_sample", undefined);
  }
}

function getSampleUrl(sample) {
  if (sample.type === 'song') {
    return Meteor.getSongUrl(Songs.findOne(sample._id));
  }
  else if (sample.type === 'transition') {
    return Meteor.getTransitionUrl(Transitions.findOne(sample._id));
  }
}
//
// /private methods
//

//
// Session variable listeners
//
Meteor.autorun(assertPlayStatus);
Meteor.autorun(assertQueue);
