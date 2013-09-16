//
// load web audio api
//

// TODO: move the relevant variables into the session thing
var context, lastMixTime = 0, BUFFERS = [], TIMERS = [];

var currSource;

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
    // TODO: make gain a variable
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
    TIMERS.push(setTimeout(function () {
      stopCurrSource();
      source.start(0, offset, duration);
      currSource = source;
    }, when * 1000.0));
  }

  function stopCurrSource(when) {
    when = when || 0;
    (currSource && currSource.stop(when));
    // TODO: make it so pauses are possible? remember that start cannot be called after start.
    currSource = undefined;
  }

  scheduleTransition = function(transition, now) {
    var offset = Session.get("offset");
    lastMixTime = context.currentTime;
    currSong = Songs.findOne(Session.get("current_song"));
    if (now) {
      console.log("TRANSITIONING NOW");
    } else if (!currSong) {
      console.log("ERROR: cannot play mix when there is no current_song");
      return;
    }

    // load songs and buffers
    transition = (transition && transition.startTime > offset + 5) ?
      transition : chooseTransition(currSong, offset);
    setCurrentTransition(transition);

    if (!transition) {
      return console.log("ERROR: found no transitions for current song");
    }
    if (transition.startTime <= offset + 5) {
      console.log("WARNING: chosen transition wasn't possible; reselecting");
    }

    var endSong = Songs.findOne({ name: transition.endSong });

    // async
    makeTransitionBuffer(transition, function (transitionBuffer) {
      makeSongBuffer(endSong, function (endBuffer) {

        // make sure the transition wasn't changed while we were loading buffers        
        if (transition._id !== Session.get("current_transition")) {
          console.log("WARNING: Transition changed while loading buffers.");
          return;
        }

        var lag = context.currentTime - lastMixTime;
        var songDuration = transition.startTime - offset - lag;
        songDuration = now ? 0 : songDuration; // play immediately if scheduled now
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
          scheduleTransition();
        }, transitionDuration * 1000.0));
      });
    });
  };

  function clearTimers() {
    TIMERS.forEach(clearTimeout);
    TIMERS = [];
  }

  // TODO: make this a volume fade
  stopMix = function() {
    console.log("STOPPING EVERYTHING!");
    clearTimers();
    stopCurrSource();
  };

  function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  }

  // algorithm to decide which transition comes next.
  // TODO: make it so that this can do "soft" transitions
  function chooseTransition(startSong, offset, callback) {
    var choices = Transitions.find({
      startSong: startSong.name,
      // TODO: formalize this concept of "5" - it's the buffer load time ("lag")
      startTime: { $gt: offset + 5 }
    }, {
      sort: { playCount: 1 }
    }).fetch();

    for (var i = 0; i < choices.length; i++) {
      console.log("found transition to: " + choices[i].endSong);
    }
    var choice = choices[0];

    console.log("CHOOSING transition: " + choice.endSong);

    if (callback) { return callback(choice); }
    else return choice;
  }

  startMix = function(startSong, transition, startPos) {
    Session.set("offset", startPos = startPos || 60);
    if (!startSong) {
      console.log("ERROR: select a song in order to start the mix");
      return;
    }

    makeSongBuffer(startSong, function (startBuffer) {
      startSong.source = playSongBuffer(startBuffer, 0, startPos);
      setCurrentSong(startSong);
      scheduleTransition(transition);
    });
  };

  selectTransition = function(transition) {
    if (transition && (transition._id !== Session.get("current_transition"))) {
      var newOffset = Session.get("offset") + context.currentTime - lastMixTime;
      Session.set("offset", newOffset);
      scheduleTransition(transition);
    }
  };

  function setCurrentSong(song) {
    Songs.update(song._id, { $inc: { playCount: 1 } });
    Session.set("current_song", song._id);
  }

  function setCurrentTransition(transition) {
    Session.set("current_transition", transition._id);
  }

}
catch(e) {
  console.log('Web Audio API is not supported in this browser');
}
