//
// load web audio api
//

BUFFER_LOAD_TIME = 5.0;
var currSource, context, lastMixTime = 0, BUFFERS = [], TIMERS = [];

try {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  function makeBuffer (url, callback) {

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
        function(error) {
          console.error('decodeAudioData error', error);
        }
        );
    };

    request.onerror = function() {
      alert('makeBuffer: XHR error');
    };

    request.send();
  }

  function makeSongBuffer(song, callback) {
    return makeBuffer('/songs/' + song.name + '.' + song.type, callback);
  }

  function makeTransitionBuffer(transition, callback) {
    return makeBuffer('/transitions/' +
      Songs.findOne(transition.startSong).name + '-' +
      Songs.findOne(transition.endSong).name + '.' + transition.type, callback);
  }

  function playSongBuffer(buffer, when, offset, duration) {
    when = when || 0;
    offset = offset || 0;
    duration = duration || buffer.duration - offset;

    // make source, make/set filters
    var source = context.createBufferSource();
    //var compressor = context.createDynamicsCompressor();
    var gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = 0.55;

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
    /*TIMERS.push(setTimeout(function () {
      stopCurrSource();
      source.start(0, offset, duration);
      currSource = source;
    }, when * 1000.0));*/
  }

  function stopCurrSource(when) {
    when = when || 0;
    (currSource && currSource.stop(when));
    currSource = undefined;
  }

  scheduleTransition = function(now) {
    var offset = Session.get("offset");
    lastMixTime = context.currentTime;

    // figure out which transition to schedule, set that as current
    var queuedTransitions = Session.get("queued_transitions");
    // TODO: make sure the following does NOT change sessions's queuedTransitions!
    var transition = queuedTransitions[0] || chooseTransition();
    if (!transition) {
      return console.log("ERROR: found no transitions for current song");
    }
    Session.set("current_transition", transition._id);
    var endSong = Songs.findOne(transition.endSong);

    // async load buffers
    makeTransitionBuffer(transition, function (transitionBuffer) {
      makeSongBuffer(endSong, function (endBuffer) {

        // make sure the transition wasn't changed while we were loading buffers        
        if (transition._id !== Session.get("current_transition")) {
          console.log("WARNING: Transition changed while loading buffers.");
          return;
        }

        var lag = context.currentTime - lastMixTime;
        // play immediately if scheduled now
        var songDuration = now ? 0 : (transition.startTime - offset - lag);
        var transitionDuration = songDuration + transitionBuffer.duration;

        console.log("transition in: "+songDuration);
        console.log("next song in: "+transitionDuration);
        console.log("buffer load lag: "+lag);

        // schedule the transition
        clearTimers(); // in case another transition was already scheduled
        TIMERS.push(setTimeout(function() {
          // start the transition
          stopCurrSource();
          transition.source = playBuffer(transitionBuffer);
          Transitions.update(transition._id, { $inc: { playCount: 1 } });
        }, songDuration * 1000.0));
        TIMERS.push(setTimeout(function() {
          // start the next song and continue the mix
          endSong.source = playSongBuffer(endBuffer, 0, transition.endTime);
          setCurrentSong(endSong);
          Session.set("offset", transition.endTime);
          console.log("setting queued_transitions from scheduleMix");
          queuedTransitions = Session.get("queued_transitions");
          queuedTransitions.shift();
          console.log(queuedTransitions);
          Session.set("queued_transitions", queuedTransitions);
          scheduleTransition();
        }, transitionDuration * 1000.0));
      });
    });
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
    console.log(Transitions.find().fetch());
  };

  function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  }

  // algorithm to decide which transition comes next.
  function chooseTransition(callback) {
    var currSong = Songs.findOne(Session.get("current_song"));
    var offset = Session.get("offset");

    var choices = Transitions.find({
      startSong: currSong._id,
      startTime: { $gt: offset + BUFFER_LOAD_TIME }
    }, {
      sort: { playCount: -1 }
    }).fetch();

    for (var i = 0; i < choices.length; i++) {
      console.log("found transition to: " + choices[i].endSong);
    }
    var transition = choices[0];
    console.log("CHOOSING transition: " + transition.endSong);

    // TODO: should this be here?
    console.log("setting queued_transitions from chooseTransition");
    console.log([transition]);
    Session.set("queued_transitions", [transition]);

    if (callback) { return callback(transition); }
    else return transition;
  }

  startMix = function(startSong, startPos) {
    Session.set("offset", startPos = startPos || 60);
    if (!startSong) {
      return console.log("ERROR: select a song in order to start the mix");
    }

    makeSongBuffer(startSong, function (startBuffer) {
      console.log("startSong");
      console.log(startSong);
      setCurrentSong(startSong);
      startSong.source = playSongBuffer(startBuffer, 0, startPos);
      scheduleTransition();
    });
  };

  function getCurrentOffset() {
    return Session.get("offset") + context.currentTime - lastMixTime;
  }

  function isValidTransition(prevTransition, transition, debug) {
    var currSong = Songs.findOne(Session.get("current_song"));

    if (!transition) {
      if (debug) console.log("ERROR: transition undefined");
      return false;
    }

    // first check against prevTransition
    if (prevTransition &&
      ((transition.startSong != prevTransition.endSong) ||
      (prevTransition.endTime > transition.startTime - BUFFER_LOAD_TIME))) {
      if (debug) console.log("ERROR: given transition does not fit prevTransition");
      return false;

    // if no prevTransition, make sure we aren't too far in the current song
    } else if (!prevTransition &&
      ((transition.startSong != currSong._id) ||
      (getCurrentOffset() > transition.startTime - BUFFER_LOAD_TIME))) {
      if (debug) console.log("ERROR: too far in currSong to queue given transition");
      return false;

    } else {
      return true;
    }
  }

  // returns a valid transition to song such that queued_transitions
  // retains maximum possible length. 
  // TODO: what if none exist? add a soft transition to the end? or maybe find a path such that one exists?
  getNearestValidTransition = function(song) {
    var queuedTransitions = Session.get("queued_transitions"),
        nextTransition;

    var transitions = Transitions.find({ endSong: song._id }).fetch();
    for (var i = 0; i < transitions.length; i++) {
      nextTransition = transitions[i];
      for (index = queuedTransitions.length - 1; index >= -1; index--) {
        if (isValidTransition(queuedTransitions[index], nextTransition)) {
          //console.log("returning index: "+(index+1)+" for song: "+song.name);
          return { 'transition': nextTransition, 'index': ++index };
        }
      }
    }
    return console.log("ERROR: found no valid transitions for: "+song.name);
  };

  queueTransition = function(transition, index) {
    var queuedTransitions = Session.get("queued_transitions");
    if (index === undefined) index = queuedTransitions.length;

    // make sure this transition fits at this index
    console.log("queueing below transition at index: "+index);
    console.log(transition);
    if (!isValidTransition(queuedTransitions[index - 1], transition, true)) {
      return console.log("ERROR: Invalid Transition given to queueTransition");
    }
    if (queuedTransitions.indexOf(transition._id) > -1) {
      console.log("WARNING: given transition to "+transition.endSong+" is already queued");
    }

    // update queuedTransitions with this transition
    queuedTransitions.splice(index, queuedTransitions.length - index, transition);
    console.log("setting queued_transitions from queueTransition");
    console.log(queuedTransitions);
    Session.set("queued_transitions", queuedTransitions);

    // if index is 0, we are replacing the current transition
    if (index === 0) {
      Session.set("offset", getCurrentOffset());
      Session.set("current_transition", transition._id);
      scheduleTransition();
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
