Session.set("waves", []);

var waves = {};
var lastWaveClicked, lastMarkMade;

var waveColors = {
  'startWave': 'mediumorchid',
  'transitionWave': 'steelblue',
  'endWave': 'salmon'
};

var progressColors = {
  'startWave': 'purple',
  'transitionWave': 'midnightblue',
  'endWave': 'orangered'
};

var cursorColors = {
  'startWave': 'navy',
  'transitionWave': 'navy',
  'endWave': 'navy'
};

Meteor.startup(function () {

  //
  // make waves
  //
  makeWave("startWave", "Drop starting song here.");
  makeWave("transitionWave", "Drop transition here.");
  makeWave("endWave", "Drop ending song here.");

  function makeWave(id, loadText) {
    var wave = Object.create(WaveSurfer);
    wave.id = id;

    // update session object to render new template
    var sessionWaves = Session.get("waves");
    sessionWaves.push({
      'id': id,
      'loadText': loadText
    });
    Session.set("waves", sessionWaves);
    waves[id] = wave;

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
              }, diff);
            }
          });
        }
      });
    };

    // flash when reaching a mark
    var flashInterval;
    wave.on('mark', function (marker) {
      var markerColor = marker.color;

      function flashMarker() {
        marker.update({ color: 'yellow' });
          Meteor.setTimeout(function () {
            marker.update({ color: markerColor });
          }, 200);
      }

      // only flash if we aren't already flashing
      if (!flashInterval) {
        // flash now
        flashMarker();
        // set flash interval
        flashInterval = Meteor.setInterval(flashMarker, 400);
        // end flash interval
        Meteor.setTimeout(function() {
          Meteor.clearInterval(flashInterval);
          flashInterval = undefined;
          marker.update({ color: markerColor });
        }, 800);
      }

    });
  }

});

Template.wave.rendered = function () {
  var id = this.data.id;

  // first handle id-specific stuff
  var wave = waves[id];
  switch (id) {

    // when a mark is reached, pause this and play transitionWave
    case 'startWave':
    wave.on('mark', function(mark) {
      if (mark.id === 'end') {
        console.log("marker diff:"+mark['diff']);
        var transitionWave = waves['transitionWave'];
        var transitionStart =
          (transitionWave.markers['start'].position) /
          getWaveDuration(transitionWave);
        transitionWave.seekTo(transitionStart);
        playWave(transitionWave);
      }
    }); break;

    // when a mark is reached, pause this and play endWave
    case 'transitionWave':
    wave.on('mark', function(mark) {
      if (mark.id === 'end') {
        var endWave = waves['endWave'];
        var endStart =
          (endWave.markers['start'].position) /
          getWaveDuration(endWave);
        endWave.seekTo(endStart);
        playWave(endWave);
      }
    }); break;

  }

  var selector = '#'+id;
  // init wave
  wave.init({
    'container': $(selector+' .waveform')[0],
    'waveColor': waveColors[id],
    'progressColor': progressColors[id],
    'cursorColor': cursorColors[id],
    'cursorWidth': 2,
    'markerWidth': 2,
    'renderer': 'Canvas',
    'audioContext': audioContext
  });
  wave.bindDragNDrop($(selector+' .waveform')[0]);

  // TODO: progress bar after wavesurfer issue is fixed
  wave.on('ready', function() {
    $(selector+' .loadText').hide();
  });
};

Template.uploaderPage.rendered = function () {
  // initialize tooltips
  $('.helptip').tooltip();

};

Template.uploader.waves = function () {
  return Session.get("waves");
};

function zoomWave(id, zoom) {
  var node = $('#'+id+' .waveform');
  var width = parseInt(node.css('width')) + zoom;
  node.css('width', width+'px');
  redrawWave(id);
}

// position is in seconds
function getWavePosition(wave) {
  return wave.timings()[0];
}

// duration is in seconds
function getWaveDuration(wave) {
  return wave.timings()[1];
}

// progress is in percent
function getWaveProgress(wave) {
  return getWavePosition(wave) / getWaveDuration(wave);
}

function redrawWave(id) {
  var wave = waves[id];
  // redraw wave
  wave.drawBuffer();
  // update with and center screen on progress
  var progress = getWaveProgress(wave);
  wave.drawer.updateProgress(progress);
  wave.drawer.recenter(progress);
  // update markers
  for (var waveId in wave.markers) {
    wave.drawer.addMark(wave.markers[waveId]);
  }
}

var playingWave;

function playWave(wave) {
  // curry arg
  if (typeof wave !== 'object') { wave = waves[wave]; }
  // if already playing this wave, pause it
  if ((playingWave && playingWave.id) === wave.id) {
    pause();
  // else, pause then play new
  } else {
    pause();
    // play new wave
    playingWave = wave;
    (wave && wave.play());
  }
}

function pause() {
  if (playingWave) {
    playingWave.pause();
    playingWave = undefined;
  }
}
/*
// drag event
var flag = 0;
var element = xxxx;
element.addEventListener("mousedown", function(){
    flag = 0;
}, false);
element.addEventListener("mousemove", function(){
    flag = 1;
}, false);
element.addEventListener("mouseup", function(){
    if(flag === 0){
        console.log("click");
    }
    else if(flag === 1){
        console.log("drag");
    }
}, false);
*/

var mouseClickHeld = false;
Template.wave.events({

  'mousedown': function (e) {
    mouseClickHeld = true;
  },

  'mouseup': function (e) {
    mouseClickHeld = false;
  },

  'mousemove .waveform': function (e) {
    // click and drag
    if (mouseClickHeld) {
      // move track
    }
  },

  'click .waveform': function (e) {
    lastWaveClicked = this.id;
  },

  'mousewheel .waveform': function (e) {
    // only do this if we have a file buffer loaded
    if (waves[this.id].backend.buffer) {
      e.preventDefault();
      e.stopPropagation();
      var direction = e.wheelDelta >= 0 ? 1 : -1;
      var zoom = 100;
      if (e.shiftKey) {
        zoom *= 10;
      }
      zoomWave(this.id, zoom * direction);
    }
  },

  'dblclick .waveform': function (e) {
    playWave(this.id);
    e.preventDefault();
  }

});

Template.uploaderPage.events({
  'click #upload': function(e) {
    // TODO: popup form for transition and song metadata?
    // TODO: think about when an audio file already exists on the server. maybe have it so
    //       the guy making the upload can choose files already there?

    // TODO: implement this to store the backend.buffer onto the s3 server
    console.log(startWave.backend);
  }
});

//
// add key event handlers
//
var keyBindingsInterval = Meteor.setInterval(function(){
   if (Meteor.Keybindings) {
     Meteor.clearInterval(keyBindingsInterval);
     addKeyBindings();
   }
}, 500);

function addKeyBindings() {
  Meteor.Keybindings.add({

   'space': function(e) {
      e.preventDefault();
      // we want spacebar to be a universal pause
      if (playingWave) {
        pause();
      } else {
        playWave(lastWaveClicked);
      }
    },

    'up': function(e) {
      e.preventDefault();
      lastMarkMade = waves[lastWaveClicked].mark({
        id: 'start',
        color: 'rgba(0, 255, 0, 0.8)'
      });
      waves[lastWaveClicked].bindMarks();
    },

    'down': function(e) {
      e.preventDefault();
      lastMarkMade = waves[lastWaveClicked].mark({
        id: 'end',
        color: 'rgba(255, 0, 0, 0.8)'
      });
      waves[lastWaveClicked].bindMarks();
    },

    'left/shift+left': function(e) {
      e.preventDefault();
      var dist = -0.005;
      if (e.shiftKey) {
         dist *= 50;
      }
      waves[lastWaveClicked].skip(dist);
    },

    'right/shift+right': function(e) {
      e.preventDefault();
      var dist = 0.005;
      if (e.shiftKey) {
         dist *= 50;
      }
      waves[lastWaveClicked].skip(dist);
    }

  });
}
