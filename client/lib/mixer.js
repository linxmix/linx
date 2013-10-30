//
// init
//
Session.set("queue", []);
Session.set("mixer_playing", false);
Session.set("mixer_volume", 1);

// private variables
var loadingWave;
var queuedWaves = [];

//
// /init
//

Mixer = {

  //
  // functions
  // 

  'play': function(sample) {
    // if given a sample, place it at start of queue and pick a first transition
    if (sample) {
      // if sample was queued successfully, pick a first transition
      if (Mixer.queue({ 'sample': sample, 'index': 0 })) {
        pickTransition();
      }
    }
    // update play status
    Session.set("mixer_playing", true);
  },

  'pause': function() {
    Session.set("mixer_playing", false);
  },

  'playPause': function(sample) {
    if (Session.get("mixer_playing")) {
      Mixer.pause();
    } else {
      Mixer.play(sample);
    }
  },

  'skip': cycleQueue,

  'stop': function() {
    Session.set("mixer_playing", false);
    assertPlayStatus(); // called to ensure this happens before wave queue is removed
    Session.set("current_sample", undefined);
    queuedWaves = [];
    Session.set("queue", []);
  },

  'clearQueue': function() {
    var queue = Mixer.getQueue();
    var index = 1;
    // if queue head is a transition, retain the endSong
    if ((queue[0] && queue[0].type) === 'transition') {
      index++;
    }
    queue.splice(index, queue.length);
    queuedWaves.splice(index, queuedWaves.length);
    Session.set("queue", queue);
  },

  'pickTransition': pickTransition,

  // NOTE: position is in seconds, progress is in percent
  'getCurrentPosition': function() {
    var wave = Mixer.getQueue('wave')[0];
    return (wave && Wave.getPosition(wave)) || 0;
  },

  // sifts through the queue to return only samples of type, or everything
  'getQueue': function(type) {
    var queue = Session.get("queue");

    switch (type) {
      case undefined: case 'sample': return queue;
      case 'wave': return queuedWaves;
      default: // filter by given type
      {
        var newQueue = [];
        // inOrder traversal
        for (var i = 0; i < queue.length; i++) {
          var sample = queue[i];
          if (sample['type'] === type) {
            newQueue.push(sample);
          }
        }

        // special case to make sure to include currTransition's startSong
        var curr = Mixer.getQueue()[0];
        if ((type === 'song') &&
          ((curr && curr['type']) === 'transition')) {
          newQueue.unshift(Songs.findOne(curr.startSong));
        }

        return newQueue;
      }
    }
  },

  // adds given sample to the queue. returns true if successful, or undefined
  'queue': function(data) {
    if (!Meteor.userId()) {
      return alert("Sorry, but you cannot stream music unless you're logged into an account that owns it. If you'd like to help test this app, contact wolfbiter@gmail.com.");
    }

    if (!data.sample) {
      return console.log("WARNING: Mixer.queue called without a sample.");
    }
    else if (data.sample.type === 'song') {
      return queueSong(data);
    }
    else if (data.sample.type === 'transition') {
      return queueTransition(data.sample, data.index);
    } else {
      return console.log("WARNING: Mixer.queue called with sample of unknown type.")
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
  },
  
};

//
// private methods
//
function queueSong(data) {
  var queue = Mixer.getQueue(),
      song = data.sample;
  if (data.index === undefined) { data.index = queue.length; }

  // coerce song into object
  if (typeof song !== 'object') {
    song = Songs.findOne(song);
    // add startTime, endTime, startVolume, endVolume to song
    $.extend(song, {
      'startTime': data.startTime,
      'endTime': data.endTime,
      'startVolume': data.startVolume,
      'endVolume': data.endVolume,
    });
  }

  // ensure volume fields of song
  if (song.startVolume === undefined) { song.startVolume = 0.8; }
  if (song.endVolume === undefined) { song.endVolume = 0.8; }

  // if the previous sample in the queue is a song,
  // make a soft transition and queue it (implicitly queueing this song)
  var prevSample = queue[data.index - 1];
  if ((prevSample && prevSample.type) === 'song') {
    var softTransition = Storage.makeSoftTransition(prevSample._id, song._id);
    return queueTransition(softTransition, data.index);
  }

  // otherwise, queue this song
  else {
    return updateQueue(song, data.index);
  }
}

function queueTransition(transition, index) {
  var queue = Mixer.getQueue();
  if (index === undefined) { index = queue.length; }

  console.log("queueTransition called with below at index: "+index);
  console.log(transition);

  // if transition fits at this index
  var prevSample = queue[index - 1];
  if (isValidTransition(prevSample, transition)) {

    // if queueing transition at front, queue startSong first
    if (index === 0) {
      queueSong({
        'sample': transition.startSong,
        'index': index++,
        'endTime': transition.startSongEnd,
        'endVolume': transition.startSongVolume
      });
    }

    // otherwise, make sure to update previous sample's endTime and endVolume
    else if (prevSample) {
      prevSample['endTime'] = transition['startSongEnd'];
      prevSample['endVolume'] = (transition['startSongVolume'] !== undefined) ?
        transition['startSongVolume'] : prevSample['endVolume'];
      Session.set("queue", queue);
    }

    // queue transition
    updateQueue(transition, index++);

    // queue endSong
    return queueSong({
      'sample': transition.endSong,
      'index': index,
      'startTime': transition.endSongStart,
      'startVolume': transition.endSongVolume,
    });

  } else {
    return console.log("ERROR: Invalid Transition given to queueTransition");
  }
}

// insert sample at index
function updateQueue(sample, index) {
  var queue = Mixer.getQueue();
  // ensure sample has a startTime
  sample.startTime = sample.startTime || 0;
  // remove stuff after this index from queue and queuedWaves
  var chopIndex = queue.length - index;
  queue.splice(index, chopIndex, sample);
  queuedWaves.splice(index, chopIndex);
  Session.set("queue", queue);
  return true;
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
      if (Mixer.getCurrentPosition() >
        transition.startSongEnd) {
        if (debug) console.log("ERROR: too far in currSample to queue given transition");
        return false;
      }
    }

    // if prevSample is not the current sample, make sure transition isn't too soon
    else if (prevSample.startTime > transition.startSongEnd) {
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

  console.log("asserting queue with queues: ");
  console.log(queue);
  console.log(queuedWaves);

  if (queueLength > 0) {

    // find out where our sample queue and wave queue diverge
    var index;
    for (index = 0; index <= queueLength; index++) {
      var wave = queuedWaves[index];
      if (JSON.stringify(wave && wave.sample) !== JSON.stringify(queue[index])) {
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

  console.log("loading sample at index: "+index);

  // if scheduling this as first and we're already playing a sample
  var currSample_id = Session.get("current_sample");
  if (currSample_id && (index === 0)) {

    // and that sample is this one, update sample and wave scheduling, then continue
    if (currSample_id === sample._id) {
      var currWave = Mixer.getQueue('wave')[0]
      currWave.sample = sample;
      scheduleWaveEnd(currWave);
      return loadNext(++index);

    // if playing wave is not this one, pause that wave since it's now old
    } else {
      pauseWave();
    }
  }

  // if already loading this sample, update loadingWave with new sample info
  if (loadingWave && (loadingWave.sample._id === sample._id)) {
    loadingWave.sample = sample;

  // otherwise, load the given sample
  } else {

    // make wave, then add it to the queue
    makeWave(sample, function (wave) {

      // assert play status in case play was waiting on load to complete
      // NOTE: queuedWaves may have changed, so calculate new index
      index = Math.min(index, queuedWaves.length);
      queuedWaves[index] = wave;
      assertPlayStatus();
      return loadNext(++index);
    });
  }
}

// function to call for loading the next sample in line
function loadNext(index) {
  var length = Mixer.getQueue().length;
  // load next sample, up to 5, if this is not the last
  if ((index < 5) && (index < length)) {
      return loadSample(index);
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

  //
  // init new wave
  //
  wave.init({
    'container': $('#mixerWave')[0],
    'audioContext': audioContext
  });

  // set loadingWave
  loadingWave = wave;

  // load url
  wave.load(Storage.getSampleUrl(sample));

  // cancel if loadingWave changes out from under us
  wave.on('loading', function (percent, xhr) {
    if (wave.sample._id !== loadingWave.sample._id) {
      console.log("canceling wave load");
      xhr.abort();
    }
  });

  // call callback when loaded
  wave.on('ready', function () {
    // make sure this was the right wave to be loading
    if (wave.sample._id === loadingWave.sample._id) {
      loadingWave = undefined;
      setWaveMarks(wave);
      wave.volume = (wave.sample.startVolume !== undefined) ?
        wave.sample.startVolume : wave.sample.volume;
      console.log("wave ready");
      return callback(wave);
    }
  });
}

// sets markers for wave such that it will transition smoothly
function setWaveMarks(wave) {
  wave.skip(wave.sample.startTime);
  Wave.markTrackEnd(wave).on('reached', cycleQueue);
  scheduleWaveEnd(wave);
}

// set end marker and volume automation
function scheduleWaveEnd(wave) {

  // if wave has a nonzero endTime, mark its end
  Wave.clearMark(wave, 'end'); // clear old mark
  var endTime = wave.sample.endTime;
  if (endTime) {
    Wave.markEnd(wave, endTime).on('reached', cycleQueue);
  }

  // if this is a song wave, automate its volume
  if (wave.sample.type === 'song') {
    // if wave is currently playing, startTime is currentPos
    var startTime = wave.sample.startTime;
    if (Session.equals("current_sample", wave.sample._id)) {
      startTime = Mixer.getCurrentPosition();
    }
    endTime = (endTime !== undefined) ? endTime : Wave.getDuration(wave);

    // add automation
    Wave.addVolumeAutomation(wave,    // wave
      startTime + 1,                  // start time
      endTime,                        // end time
      wave.sample.endVolume);         // end vol
  }
}

function cycleQueue() {
  // update sample queue
  var queue = Mixer.getQueue();
  queue.shift();
  Session.set("queue", queue);
  // update wave queue
  pauseWave();
  var cycledWave = queuedWaves.shift();
  assertPlayStatus(); // make sure new currWave is played

  // if cycledWave still has an interval, cancel it
  if (cycledWave && cycledWave.interval) {
    Meteor.clearInterval(cycledWave.interval);
    cycledWave.interval = undefined;
  }
  // if cycling to the last song, pick new transition to continue the mix
  if (queue.length === 1) {
    pickTransition();
  }
}

function assertPlayStatus() {
  if (Session.get("mixer_playing")) {
    playWave();
  } else {
    pauseWave();
  }
}

function pauseWave() {
  var currWave = Mixer.getQueue('wave')[0];
  // if currWave and currWave is not a soft transition, pause it
  if ((currWave && currWave.sample) && (currWave.sample.transitionType !== 'soft')) {
    currWave.pause();
  }
}

function playWave() {
  var wave = Mixer.getQueue('wave')[0];
  if (wave) {

    // if this is a dummy 'soft' transition wave, cycle now
    if (wave.sample.transitionType === 'soft') {
      return cycleQueue();
    }

    // otherwise, play it, assert volume, and set it as playing
    wave.play();
    assertVolume();
    Session.set("current_sample", wave.sample._id);

    // update wave playCount if not already done
    if (!wave.played) {
      wave.played = true;
      Storage.incrementPlayCount(wave.sample);
    }

  // no waves queued, so say no waves are playing
  } else {
    Session.set("current_sample", undefined);
  }
}

function assertVolume() {
  var mixerVolume = Session.get("mixer_volume");
  var wave = Mixer.getQueue('wave')[0];
  if (wave) {
    wave.setVolume(wave.volume * mixerVolume);
  }
}

// algorithm to decide which transition comes next.
// TODO: make this work when still loading the first song
function pickTransition() {
  var queue = Mixer.getQueue();
  var lastSample = queue[queue.length - 1] || Storage.getRandom(Songs);
  // if last sample is currently playing, startTime is currSample's currTime
  var startTime = (queue.length <= 1) ?
    Mixer.getCurrentPosition() : lastSample.startTime;
  var choices = Transitions.find({
    'startSong': lastSample._id,
    'startSongEnd': { $gt: startTime }
  }).fetch();

  // find choice with endSong that has least number of plays amongst choices
  var transition = choices[0],
      endSong = (transition && Songs.findOne(transition.endSong)) ||
        Storage.getRandom(Songs);
  // TODO: make this a slick database query
  for (var i = 1; i < choices.length; i++) {
    var _transition = choices[i];
    var _endSong = Songs.findOne(_transition.endSong);
    if (_endSong.playCount < endSong.playCount) {
      transition = _transition;
      endSong = _endSong;
    }
  }

  // if there is a song with a lower playCount than endSong, soft transition to it
  //var song = Songs.findOne({ 'playCount': { $lt: endSong.playCount } });
  //if (song) {
  //  transition = Storage.makeSoftTransition(lastSample._id, song._id);
  //}

  // if no transition has yet been chosen, make one up
  if (!transition) {
    transition = Storage.makeSoftTransition(lastSample._id, endSong._id);
  }

  console.log("CHOOSING transition: ");
  console.log(transition);

  Mixer.queue({ 'sample': transition });
}
//
// /private methods
//

//
// Session variable listeners
//
Meteor.autorun(assertQueue);
Meteor.autorun(assertPlayStatus);
Meteor.autorun(assertVolume);
