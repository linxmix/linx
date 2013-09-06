Songs = new Meteor.Collection("Songs");
Transitions = new Meteor.Collection("Transitions");

//
// load web audio api
//
var context, currentSong, currTime, BUFFERS = [];

//try {
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
          if (callback) callback(buffer);
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
    gain.gain.value = 0.52;

    // route source
    source.connect(gain);
    gain.connect(context.destination);
    //compressor.connect(context.destination);

    // start source, then return it
    source.start(when, offset, duration);
    return source;
  }

  function playBuffer(buffer, when, offset, duration) {
    when = when || 0;
    offset = offset || 0;
    duration = duration || buffer.duration - offset;

    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(when, offset, duration);
    return source;
  }


  function playMix(startSong, offset, iter) {
    // offset is the position of startSong when this method gets called
    offset = offset || 0;

    console.log("offset: "+offset);
    console.log("currTime: "+context.currentTime);
    currTime = context.currentTime;
    currentSong = startSong;

    // load songs and buffers
    var transition = chooseTransition(startSong, offset);
    var endSong = { name: transition.endSong, type: "mp3" };

    // async
    makeTransitionBuffer(transition, function (transitionBuffer) {
      makeSongBuffer(endSong, function (endBuffer) {

        // TODO: what is with this currTime thing?!?
        var lag = context.currentTime - currTime;
        var songDuration = transition.startTime - offset + currTime;
        var transitionDuration = songDuration + transitionBuffer.duration;

        console.log("iter:"+iter);
        console.log("transition in: "+(songDuration - lag));
        console.log("next song in: "+(transitionDuration - lag));
        console.log("playMix lag: "+lag);

        // make a transition
        startSong.source.stop(songDuration);
        playBuffer(transitionBuffer, songDuration, 0);
        endSong.source = playSongBuffer(endBuffer, transitionDuration, transition.endTime);

        // continue the mix
        setTimeout(function() {
          playMix(endSong, transition.endTime, iter + 1);
        }, (transitionDuration - context.currentTime) * 1000.0); // convert [s] to [ms]

      });
    });
  }

  function shuffle(o){
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  }

  // algorithm to decide which transition comes next. will use Session for settings?
  function chooseTransition(startSong, offset) {
    var choices = Transitions.find({
      startSong: startSong.name,
      startTime: { $gt: offset }
    }).fetch();

    for (var i = 0; i < choices.length; i++) {
      console.log("found transition to: " + choices[i].endSong);
    }
    var choice = shuffle(choices)[0];

    console.log("CHOOSING transition: " + choice.endSong);

    return choice;
  }

  setTimeout(function () {

    currTime = context.currentTime;
    var offset = 160;

    var startSong = { name: "dont you worry child", type: "mp3" };
    makeSongBuffer(startSong, function (startBuffer) {
      startSong.source = playSongBuffer(startBuffer, 0, offset);
      playMix(startSong, offset, 0);
    });
  }, 3000);

/*
  makeBuffer("/songs/stars come out.mp3", function() {
    makeBuffer("/transitions/stars come out-no beef.wav", function() {
      makeBuffer("/songs/no beef.mp3", function() {
        var start = BUFFERS[0];
        var transition = BUFFERS[1];
        var end = BUFFERS[2];

        var latency = 0.628;
        var advance = 105;
        var songDuration = 107.125320 - latency;
        var transitionDuration = songDuration + transition.duration;

        playBuffer(start, 0, advance, songDuration - advance);
        playBuffer(transition, songDuration - advance);
        playBuffer(end, transitionDuration - advance, 165.663742 - latency);
      });
    });
  });
*/
/*
  makeBuffer("/songs/no beef.mp3", function() {
    makeBuffer("/transitions/no beef-epic.wav", function() {
      makeBuffer("/songs/epic.mp3", function() {
        var start = BUFFERS[0];
        var transition = BUFFERS[1];
        var end = BUFFERS[2];

        var latency = 0.5465;
        var advance = 300;
        var songDuration = 304.146332 - latency;
        var transitionDuration = songDuration + transition.duration;

        playBuffer(start, 0, advance, songDuration - advance);
        playBuffer(transition, songDuration - advance);
        playBuffer(end, transitionDuration - advance, 35.235523 - latency);
      });
    });
  });
*/

/*
makeBuffer("/songs/alive.mp3", function() {
    makeBuffer("/transitions/alive-torrent.wav", function() {
      makeBuffer("/songs/torrent.mp3", function() {
        var start = BUFFERS[0];
        var transition = BUFFERS[1];
        var end = BUFFERS[2];

        var latency = 0;
        var val = 0.743209;
        var advance = 225;
        var songDuration = 250.603012 + latency - advance;
        var transitionDuration = songDuration + transition.duration;

        console.log("songDuration: "+songDuration);
        console.log("transitionDuration"+transitionDuration);

        playSongBuffer(start, 0, advance, songDuration);
        playBuffer(transition, songDuration);
        playSongBuffer(end, transitionDuration, 62.447994);
      });
    });
  });
*/
//}
//catch(e) {
//  alert('Web Audio API is not supported in this browser');
//}

//
// do meteor stuff
//
Template.songs.songs = function () {
  return Songs.find();
};

Template.transitions.transitions = function () {
  return Transitions.find();
};