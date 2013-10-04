//
// init
//
Session.set("load_time", 50.0); // safety net for load times
Session.set("queue", []);
Session.set("mixer_playing", false);


// private variables
var loadingWave;
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
    //if (Meteor.userId() != Meteor.users.findOne({ username: 'test' })._id) {
    //  return alert("Sorry, but you cannot stream music unless you're logged into an account that owns it. If you'd like to help test this app, contact wolfbiter@gmail.com.");
    //}
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
      '_id': 'soft',
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

  'getSampleUrl': function(sample) {
    if (sample.type === 'song') {
      return getSongUrl(Songs.findOne(sample._id));
    }
    else if (sample.type === 'transition') {
      return getTransitionUrl(Transitions.findOne(sample._id));
    }
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
    addToQueue({
      'type': "song",
      '_id': id,
      'startTime': startTime,
      'endTime': endTime
    }, index);
  }
}

function queueTransition(transition, index, startTime, endTime) {
  var queue = Mixer.getQueue();
  if (index === undefined) index = queue.length;
  // coerce transition into object
  if (typeof transition !== 'object') {
    transition = Transitions.findOne(transition);
  }

  console.log("queueTransition called with below at index: "+index);
  console.log(transition);


  // if transition fits at this index
  if (isValidTransition(transition, index)) {

    // if queueing transition at front, queue startSong first
    if (index === 0) {
      Mixer.queueSong(transition.startSong, index++, 0, transition.startSongEnd);

    // otherwise, make sure to update previous index's endTime
    } else {
      queue[index - 1].endTime = transition.startSongEnd;
      Session.set("queue", queue);
    }

    // queue transition
    addToQueue({
      'type': "transition",
      '_id': transition._id,
      'startTime': startTime,
      'endTime': endTime
    }, index++);

    // queue endSong
    Mixer.queueSong(transition.endSong, index++, transition.endSongStart);

  } else {
    return console.log("ERROR: Invalid Transition given to queueTransition");
  }
}

// insert sample at index
function addToQueue(sample, index) {
  var queue = Mixer.getQueue();
  // remove stuff after this index from queue and queuedWaves
  var chopIndex = queue.length - index;
  queue.splice(index, chopIndex, sample);
  queuedWaves.splice(index, chopIndex);
  Session.set("queue", queue);
  assertPlayStatus();
  assertQueue();
}

function isValidTransition(prevSample, transition, debug) {
  if (debug) console.log(transition);

  // if not given a transition, immediate gg
  if (!transition) {
    if (debug) console.log("ERROR: transition undefined");
    return false;
  }

  // if given transition is soft, it's definitely fine
  // TODO is that true, since the softtransition is an object?
  if (transition.transitionType === 'soft') {
    return true;
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
        transition.startSongEnd - Session.get("load_time")) {
        if (debug) console.log("ERROR: too far in currSample to queue given transition");
        return false;
      }
    }

    // if prevSample is not the current sample, make sure transition isn't too soon
    else if (prevSample.startTime > transition.startSongEnd - Session.get("load_time")) {
      if (debug) console.log("ERROR: given transition starts too soon after prevSample");
      return false;
    }
  }

  // if we get here, we've passed all our validation checks
  return true;
}

// assert samples are synchronously loaded and played in the order they are queued
function assertQueue() {
  var queue = Mixer.getQueue(),
      queueLength = queue.length;

  if (queueLength > 0) {

    // find out where our sample queue and wave queue diverge
    var index;
    for (index = 0; index <= queueLength; index++) {
      if (queuedWaves[index].sample !== queue[index]) {
        break;
      }
    }

    // load the unloaded samples, if there are any
    if (index < queueLength) {
      return loadSample(index);
    }
  }
}

// synchronously load samples starting from index
function loadSample(index) {
  var queue = Mixer.getQueue(),
      sample = queue[index];

  // only load the sample if not already loading this one
  if (!loadingWave || (loadingWave.sample !== sample)) {

    // make wave, then add it to the queue
    makeWave(sample, function (wave) {

      // assert play status in case play was waiting on load to complete
      queuedWaves[index] = wave;
      if (index === 0) {
        assertPlayStatus();
      }

      // load next transition if this is not the last
      if (++index < queue.length) {
        loadSample(index);
      }

    });
  }
}

// make wave from url, return new wave to callback
function makeWave(sample, callback) {
  var wave = Object.create(WaveSurfer);

  // sync wave with sample
  wave.sample = sample;

  // if given sample is a soft transition, this is a dummy wave, so end
  if (sample.transitionType === 'soft') {
    return callback(wave);
  }

  // hack to make mark events more precise
  wave.bindMarks = function () {
    var my = wave,
        firing = false;
    wave.backend.createScriptNode();
    wave.backend.on('audioprocess', function () {
      if (!firing) {
        Object.keys(my.markers).forEach(function (id) {
          var marker = my.markers[id];
          var position = marker.position.toPrecision(3);
          var time = my.backend.getCurrentTime().toPrecision(3);
          if (position == time) {

            firing = true;
            var diff = marker.position - my.backend.getCurrentTime();
            Meteor.setTimeout(function () {
              firing = false;
              my.fireEvent('mark', marker);
              marker.fireEvent('reached');
            }, (diff * 1000) - 2); // subtract 2ms to improve accuracy
          }
        });
      }
    });
  };
  // /hack

  //
  // init new wave
  //
  wave.init({
    'audioContext': Mixer.audioContext
  });
  wave.bindMarks();
  setWaveMarks(wave);

  // set loadingWave
  loadingWave = wave;

  // set this wave's marker events
  wave.on('mark', function (mark) {
    if (mark.id === 'end' ||
      mark.id === 'track_end') {
      cycleQueue();
    }
  });

  // load url
  // TODO: make this a progress bar
  wave.load(getSampleUrl(sample));

  // cancel if loadingWave changes out from under us
  wave.on('loading', function (percent, xhr) {
    if (wave.sample !== loadingWave.sample) {
      console.log("canceling wave load");
      xhr.abort();
    }
  });

  // call callback when loaded
  wave.on('ready', function () {
    loadingWave = undefined;
    return callback(wave);
  });
}

// sets markers for prevWave and wave such that they will transition smoothly
function setWaveMarks(wave) {

  // mark wave start
  wave.mark({
    'id': 'start',
    'position': wave.startTime || 0
  });

  // mark wave end
  if (wave.endTime) {
    wave.mark({
      'id': 'end',
      'position': wave.endTime
    });
  }

  // mark wave's track_end
  wave.mark({
    'id': 'track_end',
    'position': getWaveDuration(wave)
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

    // if this is a dummy 'soft' transition wave, cycle now
    if (wave.sample.type === 'soft') {
      cycleQueue();

    // otherwise, play it and set it as playing
    } else {
    wave.play();
    Session.set("current_sample", wave.sample._id);
    }

  // no waves queued, so say no waves are playing
  } else {
    Session.set("current_sample", undefined);
  }
}

function getSongUrl(song) {
  var part = Mixer.part;
  if (Mixer.local) part = "";
  return part + 'songs/' + song.name + '.' + song.fileType;
}

function getTransitionUrl(transition) {
  var part = Mixer.part;
  if (Mixer.local) part = "";
  return part + 'transitions/' +
    Songs.findOne(transition.startSong).name + '-' +
    Songs.findOne(transition.endSong).name + '.' + transition.fileType;
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
    transition = makeSoftTransition(currSample_id, song._id);
  }

  console.log("CHOOSING transition: ");
  console.log(transition);

  Mixer.queue(transition);
}
//
// /private methods
//

//
// Session variable listeners
//
Meteor.autorun(assertPlayStatus);
