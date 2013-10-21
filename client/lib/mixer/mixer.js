//
// init
//
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
  'local': false,
  'part': 'http://s3-us-west-2.amazonaws.com/linx-music/',
  'audioContext': audioContext,

  //
  // functions
  // 

  'play': function(sample) {
    // if given a sample, place it at start of queue and pick a first transition
    if (sample) {
      // if sample was queued successfully, pick a first transition
      if (Mixer.queue(sample, 0)) {
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

  'skip': function() {
    cycleQueue();
  },

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
    return (wave && getWavePosition(wave)) || 0;
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
  
  // get a random entry from given collection
  // TODO: make this true random and not need to get every doc
  'getRandom': function(coll) {
    var found = coll.find();
    var count = found.count() - 1; // -1 for array indexing
    var rand = Math.round(Math.random() * count);
    return found.fetch()[rand];
  },

  // creates a soft transition object from startSong to endSong
  'makeSoftTransition': function(startSong, endSong) {
    return {
      'type': 'transition',
      '_id': 'soft',
      'startSong': startSong,
      'endSong': endSong,
      'transitionType': 'soft',
      'volume': 1.0
    };
  },

  // adds given sample to the queue. returns true if successful, or undefined
  'queue': function(sample, index, startTime, endTime) {
    if (!Meteor.userId()) {
      return alert("Sorry, but you cannot stream music unless you're logged into an account that owns it. If you'd like to help test this app, contact wolfbiter@gmail.com.");
    }

    if (!sample) {
      return console.log("WARNING: Mixer.queue called without a sample");
    }
    else if (sample.type === 'song') {
      return queueSong(sample, index, startTime, endTime);
    }
    else if (sample.type === 'transition') {
      return queueTransition(sample, index, startTime, endTime);
    }
  },

  'getSampleUrl': function(sample, local) {
    var part = Mixer.part, ret;
    if (local || Mixer.local) part = "";
    if (sample.type === 'song') {
      ret = getSongUrl(sample, part);
    }
    else if (sample.type === 'transition') {
      ret = getTransitionUrl(sample, part);
    }
    // replace whitespace with underscore so s3 accepts it
    ret = ret.replace(/\s/g, '_');
    console.log("getSampleUrl returning: "+ret);
    return ret;
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
  },

  // print all sample urls not present on s3 server
  'checkExistingSamples': function(coll, prefix) {
    var samples = coll.find().fetch();
    Meteor.call('getList', prefix, function(err, data) {
      if (err) { return console.log(err); }
      var urlList = data.Contents.map(function (listItem) {
        return listItem.Key;
      });

      // function to check to see if value exists in array
      function isInArray(value, array) {
        return array.indexOf(value) > -1 ? true : false;
      }

      // remove samples that are not on server
      samples.filter(function (sample) {
        var url = Mixer.getSampleUrl(sample, true);
        var bool = isInArray(url, urlList);
        if (!bool) {
          console.log("s3 is missing sample: "+url);
        }
        return bool;
      });
    });
  },
};

//
// private methods
//

function queueSong(song, index, startTime, endTime) {
  var queue = Mixer.getQueue();
  if (index === undefined) index = queue.length;
  // coerce song into object
  if (typeof song !== 'object') {
    song = Songs.findOne(song);
  }

  // if the last sample in the queue is a song,
  // make a soft transition and queue it (implicitly queueing this song)
  var lastSample = queue[queue.length - 1];
  if ((lastSample && lastSample.type) === 'song') {
    var softTransition = Mixer.makeSoftTransition(lastSample._id, song._id);
    queueTransition(softTransition, index);

  // otherwise, queue this song
  } else {
    return addToQueue(song, startTime, endTime, index);
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

  // if queueing transition at front, queue startSong first
  if (index === 0) {
    queueSong(transition.startSong, index++, undefined, transition.startSongEnd);
  }

  // if transition fits at this index
  var prevSample = queue[index - 1];
  if (isValidTransition(prevSample, transition)) {

    // otherwise, make sure to update previous sample's endTime
    if (prevSample) {
      prevSample.endTime = transition.startSongEnd;
      Session.set("queue", queue);
    }

    // queue transition
    addToQueue(transition, transition.startTime, transition.endTime, index++);

    // queue endSong
    return queueSong(transition.endSong, index++, transition.endSongStart);

  } else {
    return console.log("ERROR: Invalid Transition given to queueTransition");
  }
}

// insert sample at index
function addToQueue(sample, startTime, endTime, index) {
  startTime = startTime || 0;
  // add start and end time to given sample
  $.extend(sample, {
      'startTime': startTime,
      'endTime': endTime
  });
  var queue = Mixer.getQueue();
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
  //console.log(sample);

  // if scheduling this as first and we're already playing a sample
  var currSample_id = Session.get("current_sample");
  if (currSample_id && (index === 0)) {

    // and that sample is this one, update sample and wave scheduling, then continue
    if (currSample_id === sample._id) {
      Mixer.getQueue('wave')[0].sample = sample;
      setWaveEndMark(Mixer.getQueue('wave')[0]);
      // load next sample, up to 5, if this is not the last
      if ((++index < 5) && (index < queue.length)) {
        return loadSample(index);
      }

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

      // load next transition if this is not the last
      // NOTE: queue length may have changed, so take that into account
      if (++index < Mixer.getQueue().length) {
        return loadSample(index);
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
    'container': $('#mixerWave')[0],
    'audioContext': Mixer.audioContext
  });

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
  wave.load(Mixer.getSampleUrl(sample));

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
      wave.bindMarks();
      console.log("wave ready");
      return callback(wave);
    }
  });
}

// sets markers for wave such that it will transition smoothly
function setWaveMarks(wave) {

  // mark wave start
  var startTime = wave.sample.startTime || 0;
  wave.mark({
    'id': 'start',
    'position': startTime
  });
  // set this wave to start at its startTime
  wave.skip(startTime);

  // separate function so it can be called alone
  setWaveEndMark(wave);

  // mark wave's track_end
  wave.mark({
    'id': 'track_end',
    'position': getWaveDuration(wave)
  });
}

function setWaveEndMark(wave) {
  var endTime = wave.sample.endTime;
  // mark wave end
  if (endTime) {
    wave.mark({
      'id': 'end',
      'position': endTime
    });
  }
}

function currentProgress() {
  var wave = Mixer.getQueue('wave')[0];
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
  console.log(queuedWaves.shift().empty());

  // update sample queue
  var queue = Mixer.getQueue();
  queue.shift();
  Session.set("queue", queue);
  // if cycling to the last song, pick new transition to continue the mix
  // TODO: implement this
  if (queue.length === 1) {
    pickTransition();
  }

  // confirm play status
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
  var currWave = Mixer.getQueue('wave')[0];
  // if currWave and currWave is not a soft transition, pause it
  if (currWave && (currWave.sample.transitionType !== 'soft')) {
    currWave.pause();
  }
}

function playWave() {
  var wave = Mixer.getQueue('wave')[0];
  if (wave) {

    // if this is a dummy 'soft' transition wave, cycle now
    if (wave.sample.transitionType === 'soft') {
      cycleQueue();

    // otherwise, play it and set it as playing
    } else {
      wave.setVolume(wave.sample.volume);
      wave.play();
      Session.set("current_sample", wave.sample._id);
    }

  // no waves queued, so say no waves are playing
  } else {
    Session.set("current_sample", undefined);
  }
}

function getSongUrl(song, part) {
  return part + 'songs/' + song.name + '.' + song.fileType;
}

function getTransitionUrl(transition, part) {
  return part + 'transitions/' +
    Songs.findOne(transition.startSong).name + '-' +
    Songs.findOne(transition.endSong).name + '.' + transition.fileType;
}

// algorithm to decide which transition comes next.
// TODO: make this work when still loading the first song
function pickTransition() {
  var queue = Mixer.getQueue();
  var lastSample = queue[queue.length - 1] || Mixer.getRandom(Songs);
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
        Mixer.getRandom(Songs);
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
  //  transition = Mixer.makeSoftTransition(lastSample._id, song._id);
  //}

  // if no transition has yet been chosen, make one up
  if (!transition) {
    transition = Mixer.makeSoftTransition(lastSample._id, endSong._id);
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
Meteor.autorun(assertQueue);
Meteor.autorun(assertPlayStatus);
