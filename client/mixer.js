//
// load web audio api
//

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
      transition.startSong + '-' +
      transition.endSong + '.' + transition.type, callback);
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
    if (false) {
      TIMERS.push(setTimeout(function () {
        stopCurrSource();
        source.start(0, offset, duration);
        currSource = source;
      }, when * 1000.0));
    }
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
    // TODO: make sure the following does NOT change session's queuedTransitions!
    var transition = queuedTransitions.shift() || chooseTransition();
    if (transition && (transition.startTime <= offset + 5)) {
      console.log("WARNING: chosen transition wasn't possible; retrying");
      transition = chooseTransition();
    }
    if (!transition) {
      return console.log("ERROR: found no transitions for current song");
    }
    Session.set("current_transition", transition._id);
    var endSong = Songs.findOne({ name: transition.endSong });

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
    stopCurrSource();
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
      startSong: currSong.name,
      startTime: { $gt: offset + 5 }
    }, {
      sort: { playCount: 1 }
    }).fetch();

    for (var i = 0; i < choices.length; i++) {
      console.log("found transition to: " + choices[i].endSong);
    }
    var transition = choices[0];

    console.log("CHOOSING transition: " + transition.endSong);

    if (callback) { return callback(transition); }
    else return transition;
  }

  startMix = function(startSong, startPos) {
    Session.set("offset", startPos = startPos || 60);
    if (!startSong) {
      return console.log("ERROR: select a song in order to start the mix");
    }

    makeSongBuffer(startSong, function (startBuffer) {
      startSong.source = playSongBuffer(startBuffer, 0, startPos);
      setCurrentSong(startSong);
      scheduleTransition();
    });
  };

  getValidTransition = function(song) {
    // TO WRITE: returns a valid transition to song such that queued_transitions
    //           retains maximum possible length. 
    // TODO: what if none exist? add a soft transition to the end? or maybe find a path such that one exists?
    return { 'transition': undefined, 'index': 0 };
  };

  queueTransition = function(transition, index) {
    var queuedTransitions = Session.get("queued_transitions");
    index = index || queuedTransitions.length;
    if (!transition) {
      return console.log("WARNING: queueTransition called without a transition");
    } else if (queuedTransitions.indexOf(transition._id) > -1) {
      console.log("WARNING: given transition to "+transition.endSong+" is already queued");
    }

    // make sure this transition fits at this index
    var prevTransition = queuedTransitions[index - 1];
    if (prevTransition && (transition.startSong != prevTransition.endSong)) {
      return console.log("ERROR: given transition does not fit prevTransition");
    }

    // update queuedTransitions with this transition
    queuedTransitions.splice(index, queuedTransitions.length - index, transition);
    Session.set("queued_transitions", queuedTransitions);

    // if index is 0, we are replacing the current transition
    if (index === 0) {
      Session.set("offset",
        Session.get("offset") + context.currentTime - lastMixTime);
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
