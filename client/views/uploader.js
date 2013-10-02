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

    // update session object to render new template
    var sessionWaves = Session.get("waves");
    sessionWaves.push({
      'id': id,
      'loadText': loadText
    });
    Session.set("waves", sessionWaves);
    waves[id] = wave;

    // Flash when reaching a mark
    wave.on('mark', function (marker) {
      console.log("wave mark reached");
      var markerColor = marker.color;

      setTimeout(function () {
        marker.update({ color: 'yellow' });
      }, 100);

      setTimeout(function () {
        marker.update({ color: markerColor });
      }, 300);
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
      wave.pause();
      var transitionWave = waves['transitionWave'];
      var transitionStart = transitionWave.markers['start'].position;
      transitionWave.skip(transitionStart);
      transitionWave.play();
    }); break;

    // when a mark is reached, pause this and play endWave
    case 'transitionWave':
    wave.on('mark', function(mark) {
      wave.pause();
      var endWave = waves['endWave'];
      var endStart = endWave.markers['start'].position;
      endWave.skip(endStart);
      endWave.play();
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
  waves[id].drawBuffer();
}

Template.wave.events({

  'click .waveform': function (e) {
    lastWaveClicked = waves[this.id];
  },

  'mousewheel': function (e) {
    // only do this if we have a file buffer loaded
    if (waves[this.id].backend.buffer) {
      e.preventDefault();
      e.stopPropagation();
      var direction = e.wheelDelta >= 0 ? 1 : -1;
      var zoom = 70;
      if (e.shiftKey) {
        zoom *= 10;
      }
      zoomWave(this.id, zoom * direction);
    }
  },

  'dblclick .waveform': function (e) {
    var wave = waves[this.id];
    if (!wave) { return; }
    wave.playPause();
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
      lastWaveClicked.playPause();
    },

    'up': function(e) {
      e.preventDefault();
      lastMarkMade = lastWaveClicked.mark({
        id: 'start',
        color: 'rgba(0, 255, 0, 0.8)'
      });
    },

    'down': function(e) {
      e.preventDefault();
      lastMarkMade = lastWaveClicked.mark({
        id: 'end',
        color: 'rgba(255, 0, 0, 0.8)'
      });
    },

    'left/shift+left': function(e) {
      e.preventDefault();
      var dist = -0.005;
      if (e.shiftKey) {
         dist *= 50;
      }
      lastWaveClicked.skip(dist);
    },

    'right/shift+right': function(e) {
      e.preventDefault();
      var dist = 0.005;
      if (e.shiftKey) {
         dist *= 50;
      }
      lastWaveClicked.skip(dist);
    }

  });
}
