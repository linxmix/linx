// private variable
queuedWaves = [];

//
// exported methods
//

// TODO: fix this
startMix = function(startSong, startPos) {
  if (Meteor.userId() != Meteor.users.findOne({ username: 'test' })._id) {
    return alert("Sorry, but you cannot stream music unless you're logged into an account that owns it. If you'd like to help test this app, contact wolfbiter@gmail.com.");
  }
  startPos = startPos || 0;
  if (!startSong) {
    return console.log("ERROR: select a song in order to start the mix");
  }
  Session.set("current_transition", startSong._id);
  scheduleSong(startSong._id, startSong, 0, startPos);
};

// TODO: fix this
pauseMix = function() {
  console.log("PAUSING EVERYTHING!");
  var currWave = queuedWaves[0];
  if (currWave) {
    currWave.pause();
  } else {
    // TODO: cancel any loading songs here
  }
};

// TODO: fix this. isn't this just cycleQueue?
transitionNow = function() {
  loadTransition(true);
};

// returns a valid transition to song such that the queue
// retains maximum possible length. 
// TODO: what if none exist? add a soft transition to the end? or maybe find a path such that one exists?
getNearestValidTransition = function(song) {
  var queue = Session.get("queue"),
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
};

queueSong = function(id, index, startTime, endTime) {
  startTime = startTime || 0;
  endTime = endTime || 0;
  if (index === undefined) index = queue.length;
  // coerce id into id
  if (typeof id === 'object') {
    id = id._id;
  }
  queueSample({
    'type': "song",
    '_id': id,
    'startTime': startTime,
    'endTime': endTime
  }, index);
  assertQueue();
};

// TODO: transition objects need start and end times for themselves too
queueTransition = function(transition, index, startTime, endTime) {
  startTime = startTime || 0;
  endTime = endTime || 0;
  if (index === undefined) index = queue.length;
  // coerce transition into object
  if (typeof transition !== 'object') {
    transition = Transitions.findOne(transition);
  }

  console.log("queueTransition called with below at index: "+index);
  console.log(transition);

  // if queueing transition at front, queue its song first
  if (index === 0) {
    queueSong(transition.startSong, index++, 0, transition.startTime);
  }

  // if transition fits at this index, queue it and endSong
  if (isValidTransition(transition, index)) {
    // set prevSample's endTime
    queueSong(transition.endSong, index++, transition.endTime);
    queueSample({
      'type': "transition",
      '_id': transition._id,
      'startTime': startTime,
      'endTime': endTime
    }, index++);
    queueSong(transition.endSong, index++, transition.endTime);
  } else {
    return console.log("ERROR: Invalid Transition given to queueTransition");
  }

  assertQueue();
};

function queueSample(sample, index) {
  var queue = Session.get("queue");
  queue.splice(index, queue.length - index, sample);
  Session.set("queue", queue);
}
//
// /exported methods
//


//
// private methods
//

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
      startSong: currSample_id,
      endSong: song._id,
      startTime: 0,
      endTime: 0
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

    // TODO: make sure current_sample is undefined if there are no waves loaded!
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

// load samples as they are queued
function assertQueue() {
  var queue = Session.get("queue"),
      queueLength = queue.length;

  // TODO: make it understand what to do while still loading songs and queue is changed.
  //       for example: what to do if song we are currently loading is no longer needed?

  // TODO: should we remove queuedWaves when queue is cut to 0?
  if (queueLength > 0) {

    // find out where our sample queue and wave queue diverge
    // TODO: what if wave queue is longer than sample queue?
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
  var queue = Session.get("queue"),
      sample = queue[index],
      sampleUrl = getSampleUrl(sample);

  // make and prep wave, then add it to the queue
  makeWave(sampleUrl, function (wave) {
    wave = prepWave(wave, sample);
    queuedWaves[index] = wave;

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
          prevWave.pause();
          cycleQueue();
        }
      });

    // else no prevWave, cycle now
    } else {
      cycleQueue();
    }

    // load next transition if this is not the last
    if (++index < queue.length) {
      loadSample(index);
    }

  });
}

function prepWave(wave, sample) {
  wave._id = sample._id;
  wave.skip(sample.startTime);
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

function currentPosition() {
  return (queuedWaves[0] && getWavePosition(queuedWaves[0]));
}

function getWavePosition(wave) {
  return wave.timings[0];
}

function getWaveDuration(wave) {
  return wave.timings[1];
}

function cycleQueue() {

  // update wave queue
  queuedWaves[0].pause();
  queuedWaves.shift();

  // update sample queue
  var queue = Session.get("queue");
  queue.shift();
  Session.set("queue", queue);

  // TODO: how to handle if sample queue is empty?
  if (queuedWaves[0]) {
    queuedWaves[0].play();
    Session.set("current_sample", queuedWaves[0]._id);
  }
  else {
    Session.set("current_sample", undefined);
  }
}

function getSampleUrl(sample) {
  if (sample.type === 'song') {
    return getSongUrl(Songs.findOne(sample._id));
  }
  else if (sample.type === 'transition') {
    return getTransitionUrl(Transitions.findOne(sample._id));
  }
}

// make wave from url, return new wave to callback
function makeWave(url, callback) {

  // init new wave
  var wave = Object.create(WaveSurfer);
  wave.init({
    audioContext: context
  });

  // load url
  // TODO: make this a progress bar
  wave.load(url);
  wave.on('ready', function () {
    callback(wave);
  });
}
//
// /private methods
//