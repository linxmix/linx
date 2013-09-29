//
// load web audio api
//

var currSource, context, lastMixTime = 0, BUFFERS = [], TIMERS = [];

try {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  function makeBuffer(url, callback) {

    console.log("making buffer with url: "+url);

    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      // Asynchronously decode the audio file data in request.response
      context.decodeAudioData(
        request.response,
        function(buffer) {
          if (!buffer) {
            alert('error decoding file data: ' + url);
            return;
          }
          BUFFERS.push(buffer);
          if (callback) return callback(buffer);
          else return buffer;
        },
        function(err) {
          console.error('decodeAudioData error', err);
        }
        );
    };

    request.onerror = function() {
      alert('makeBuffer: XHR error');
    };

    request.send();
  }

  function makeSongBuffer(song, callback) {
    var url = '/songs/' + song.name + '.' + song.type;
    Meteor.call('getFileUrl', url, function (err, fileUrl) {
      if (err) { return console.error("getFileUrl error: ", err); }
      return makeBuffer(fileUrl, callback);
    });
  }

  function makeTransitionBuffer(transition, callback) {
    var url = '/transitions/' +
      Songs.findOne(transition.startSong).name + '-' +
      Songs.findOne(transition.endSong).name + '.' + transition.type;

    Meteor.call('getFileUrl', url, function (err, fileUrl) {
      if (err) { return console.error("getFileUrl error: ", err); }
      return makeBuffer(fileUrl, callback);
    });
  }

  function playSongBuffer(buffer, when, offset, duration) {
    when = when || 0;
    offset = offset || 0;
    duration = duration || buffer.duration - offset;

    console.log("PLAYING SONG BUFFER: "+buffer);

    // make source, make/set filters
    var source = context.createBufferSource();
    //var compressor = context.createDynamicsCompressor();
    var gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = 0.6;

    // route source
    source.connect(gain);
    gain.connect(context.destination);
    //compressor.connect(context.destination);
    return playSource(source, when, offset, duration);
  }

  function playBuffer(buffer, when, offset, duration) {
    when = when || 0;
    offset = offset || 0;
    duration = duration || buffer.duration - offset;

    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    return playSource(source, when, offset, duration);
  }

  function playSource(source, when, offset, duration) {
    // start source, set it as currSource, then return it
    //console.log("playSource offset: "+offset);
    if (when != 0) { console.log("WARNING: playSource's when is nonzero: "+when); }
    //TIMERS.push(setTimeout(function () {
    //}, when * 1000.0));
    stopCurrSource();
    source.start(0, offset, duration);
    currSource = source;
  }

  function stopCurrSource(when) {
    when = when || 0;
    (currSource && currSource.stop(when));
    currSource = undefined;
  }

  function scheduleSong(_id, endSong, when, offset) {
    var currTime = context.currentTime;
    makeSongBuffer(endSong, function (endBuffer) {

      // calculate lag
      var lag = context.currentTime - currTime;
      when -= lag;

      // validation
      if (when <= 0) {
        console.log("WARNING: scheduled song: "+endSong.name+" started late by: "+when);
        when = 0;
      }
      if (_id != Session.get("current_transition")) {
        return console.log("WARNING: Transition changed while loading song buffer.");
      }
      console.log("next song in: "+when);
      console.log("song load lag: "+lag);

      // start the next song and continue the mix
      TIMERS.push(setTimeout(function() {
        endSong.source = playSongBuffer(endBuffer, 0, offset);
        setCurrentSong(endSong);
        Session.set("offset", offset);
        queuedTransitions = Session.get("queued_transitions");
        queuedTransitions.shift();
        console.log("setting queued_transitions from scheduleSong");
        console.log(queuedTransitions);
        Session.set("queued_transitions", queuedTransitions);
        doNextTransition();
      }, when * 1000.0));
    });
  }

  function scheduleTransition(transition, endSong, when, callback) {
    clearTimers(); // in case any others were already scheduled
    var currTime = context.currentTime;
    makeTransitionBuffer(transition, function (transitionBuffer) {

      // calculate load lag
      var lag = context.currentTime - currTime;
      when -= lag;

      // validation
      if (when <= 0) {
        console.log(
          "WARNING: scheduled transition w endSong: "+endSong.name+" started late by: "+when);
        when = 0;
      }
      if (transition._id !== Session.get("current_transition")) {
        return console.log(
          "WARNING: Transition changed while loading transition buffer.");
      }
      console.log("transition in: "+when);
      console.log("transition load lag: "+lag);

      // schedule the transition
      TIMERS.push(setTimeout(function() {
        // start the transition
        stopCurrSource();
        transition.source = playBuffer(transitionBuffer);
        Transitions.update(transition._id, { $inc: { playCount: 1 } });
      }, when * 1000.0));

      callback(when + transitionBuffer.duration);
    });
  }

  doNextTransition = function (now) {
    var offset = Session.get("offset");
    lastMixTime = context.currentTime;
    // figure out which transition to schedule, set that as current
    var queuedTransitions = Session.get("queued_transitions");
    var transition = queuedTransitions[0] || chooseTransition();
    var endSong = Songs.findOne(transition.endSong);

    if (!transition) {
      return console.log("ERROR: found no transitions for current song");

    // if there's no ID, this is a "soft" transition
    } else if (!transition._id) {
      console.log("SOFT transition");
      // set current transition to this song's ID to signify a "soft" transition
      Session.set("current_transition", endSong._id);
      var when = (now || !currSource) ? 0 : (currSource.buffer.duration - offset);
      scheduleSong(endSong._id, endSong, when, 0);

    // this is a regular transition
    } else {
      Session.set("current_transition", transition._id);

      // TODO: make these faster by being completely asynchronous,
      //       knowing transition duration ahead of time and handling lag appropriately
      // load transition buffer
      var when = now ? 0 : (transition.startTime - offset);
      scheduleTransition(transition, endSong, when, function (transitionEnd) {
        scheduleSong(transition._id, endSong, transitionEnd, transition.endTime);
      });
    }
  };

  function clearTimers() {
    TIMERS.forEach(clearTimeout);
    TIMERS = [];
  }

  stopMix = function() {
    console.log("STOPPING EVERYTHING!");
    clearTimers();
    Session.set("queued_transitions", []);
    Session.set("current_transition", undefined);
    Session.set("current_song", undefined);
    stopCurrSource();
  };

  function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  }

  // algorithm to decide which transition comes next.
  function chooseTransition(callback) {
    var currSong_id = Session.get("current_song");
    var offset = Session.get("offset");

    var choices = Transitions.find({
      startSong: currSong_id,
      startTime: { $gt: offset + BUFFER_LOAD_TIME }
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
      transition = { startSong: currSong_id, endSong: song._id };
    }

    console.log("CHOOSING transition: ");
    console.log(transition);

    // TODO: should this be here? shouldnt we be calling queueTransition?
    console.log("setting queued_transitions from chooseTransition");
    console.log([transition]);
    Session.set("queued_transitions", [transition]);

    if (callback) { return callback(transition); }
    else return transition;
  }

  startMix = function(startSong, startPos) {
    Session.set("offset", startPos = startPos || 0);
    Session.set("queued_transitions", []);
    if (!startSong) {
      return console.log("ERROR: select a song in order to start the mix");
    }

    makeSongBuffer(startSong, function (startBuffer) {
      setCurrentSong(startSong);
      startSong.source = playSongBuffer(startBuffer, 0, startPos);
      doNextTransition();
    });
  };

  function getCurrentOffset() {
    return Session.get("offset") + context.currentTime - lastMixTime;
  }

  function isValidTransition(prevTransition, transition, debug) {

    // if not given a transition, immediate gg
    if (!transition) {
      if (debug) console.log("ERROR: transition undefined");
      return false;
    }

    // if given transition is "soft", it's definitely fine
    if (!transition._id) {
      return true;
    }

    // if given a prevTransition
    if (prevTransition) {

      // check to make sure transition fits with prevTransition
      if (prevTransition.endSong != transition.startSong) {
        if (debug) console.log("ERROR: given transition does not fit prevTransition");
        return false;
      }

      // if prevTransition is not soft, also make sure transition isn't too soon
      if (prevTransition._id &&
        (prevTransition.endTime > transition.startTime - BUFFER_LOAD_TIME)) {
        if (debug) console.log("ERROR: given transition starts too soon after prevTransition");
        return false;
      }
    }

    // if no prevTransition, make sure we aren't too far in the current song
    if (!prevTransition &&
      ((transition.startSong != Session.get("current_song")) ||
      (getCurrentOffset() > transition.startTime - BUFFER_LOAD_TIME))) {
      if (debug) console.log("ERROR: too far in currSong to queue given transition");
      return false;
    }

    // if we get here, we've passed all our validation checks
    return true;
  }

  // returns a valid transition to song such that queued_transitions
  // retains maximum possible length. 
  // TODO: what if none exist? add a soft transition to the end? or maybe find a path such that one exists?
  getNearestValidTransition = function(song) {
    var queuedTransitions = Session.get("queued_transitions"),
        transition;

    var transitions = Transitions.find({ endSong: song._id }).fetch();
    for (var i = 0; i < transitions.length; i++) {
      transition = transitions[i];
      for (index = queuedTransitions.length - 1; index >= -1; index--) {
        if (isValidTransition(queuedTransitions[index], transition)) {
          //console.log("returning index: "+(index+1)+" for song: "+song.name);
          return { 'transition': transition, 'index': ++index };
        }
      }
    }
    return console.log("ERROR: found no valid transitions for: "+song.name);
  };

  queueTransition = function(transition, index) {
    var queuedTransitions = Session.get("queued_transitions");
    if (index === undefined) index = queuedTransitions.length;
    var prevTransition = queuedTransitions[index - 1];

    console.log("queueTransition called with below at index: "+index);
    console.log(transition);

    // make sure this transition fits at this index
    if (!isValidTransition(prevTransition, transition, true)) {
      return console.log("ERROR: Invalid Transition given to queueTransition");
    }

    // TODO: is this check necessary?
    /*
    if (queuedTransitions.indexOf(transition._id) > -1) {
      console.log("WARNING: given transition to "+transition.endSong+" is already queued");
    }
    */

    // if this transition is "soft", fill in its startSong
    if (!transition._id) {
      console.log("queueing soft transition");
      transition.startSong =
        (prevTransition && prevTransition.endSong) ||
        Session.get("current_song");
    }

    // update queuedTransitions with this transition
    queuedTransitions.splice(index, queuedTransitions.length - index, transition);
    console.log("setting queued_transitions from queueTransition");
    console.log(queuedTransitions);
    Session.set("queued_transitions", queuedTransitions);

    // if index is 0, we are replacing the current transition and must schedule it now
    if (index === 0) {
      Session.set("offset", getCurrentOffset());
      doNextTransition();
    }
  };

  function setCurrentSong(song) {
    Songs.update(song._id, { $inc: { playCount: 1 } });
    Session.set("current_song", song._id);
  }

}
catch(e) {
  alert('Web Audio API is not supported in this browser');
}
