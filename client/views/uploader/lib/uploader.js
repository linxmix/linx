//
// init
//
Session.set("waves", []);

// private variables

var waveColors = {
  'startWave': 'mediumorchid',
  'transitionWave': 'steelblue',
  'endWave': 'coral'
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
  makeWave("startWave", "Drop starting song here", true);
  makeWave("transitionWave", "Drop new transition here", false);
  makeWave("endWave", "Drop ending song here", true);

});

//
// /init
//

function makeWave(id, loadText, isSongWave) {
  var wave = Object.create(WaveSurfer);
  wave.id = id;

  // update session object to render new template
  var sessionWaves = Session.get("waves");
  sessionWaves.push({
    'id': id,
    'loadText': loadText,
    'isSongWave': isSongWave
  });
  Session.set("waves", sessionWaves);
  Uploader.waves[id] = wave;

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
              console.log("firing with diff: "+diff);
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
  // flash when reaching a mark
  //
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

Template.wave.rendered = function () {
  var id = this.data.id;

  // first handle id-specific stuff
  var wave = Uploader.waves[id];
  switch (id) {

    // when a mark is reached, pause this and play transitionWave
    case 'startWave':
    wave.on('mark', function(mark) {
      if (mark.id === 'end') {
        var transitionWave = Uploader.waves['transitionWave'];
        var transitionStart =
          (transitionWave.markers['start'].position) /
          Uploader.getWaveDuration(transitionWave);
        transitionWave.seekTo(transitionStart);
        Uploader.playWave(transitionWave);
      }
    }); break;

    // when a mark is reached, pause this and play endWave
    case 'transitionWave':
    wave.on('mark', function(mark) {
      if (mark.id === 'end') {
        var endWave = Uploader.waves['endWave'];
        var endStart =
          (endWave.markers['start'].position) /
          Uploader.getWaveDuration(endWave);
        endWave.seekTo(endStart);
        Uploader.playWave(endWave);
      }
    }); break;

  }

  // init wave
  var selector = '#'+id;
  wave.init({
    'container': $(selector+' .waveform')[0],
    'waveColor': waveColors[id],
    'progressColor': progressColors[id],
    'cursorColor': cursorColors[id],
    'minPxPerSec': 10,
    'fillParent': false,
    'scrollParent': true,
    'cursorWidth': 2,
    'markerWidth': 2,
    'renderer': 'Canvas',
    'audioContext': audioContext
  });
  wave.bindDragNDrop($(selector+' .waveform')[0]);
  wave.bindMarks();

  // TODO: progress bar after wavesurfer issue is fixed
  wave.on('ready', function() {
    // hide load text
    $(selector+' .loadText').hide();

    // if wave has no song, it must been drag and drop
    // => so prompt the user to get the metadata
    if (!wave.song && (id !== 'transitionWave')) {
      $('#songInfoDialog').modal('show');
      Uploader.waves['modalWaveOpen'] = Uploader.waves[id];
    }

    // set volume and volume slider
    var sample = wave.song || wave.transition;
    if (sample && sample.volume) {
      wave.setVolume(sample.volume);
      // update volumeSlider
      $(selector+' .volumeSlider').slider('setValue', sample.volume);
    }

  });
};

Template.uploaderPage.rendered = function () {
  // initialize tooltips
  $('.helptip').tooltip();
};

Template.uploader.waves = function () {
  return Session.get("waves");
};

//
// Make Uploader
//

Uploader = {

  //
  // vars
  //
  'waves': {},

  //
  // methods
  //

  // position is in seconds
  'getWavePosition': function(wave) {
    return wave.timings()[0];
  },

  // duration is in seconds
  'getWaveDuration': function(wave) {
    return wave.timings()[1];
  },

  // progress is in percent
  'getWaveProgress': function(wave) {
    return Uploader.getWavePosition(wave) / Uploader.getWaveDuration(wave);
  },

  'playWave': function(wave) {
    // curry arg
    if (typeof wave !== 'object') { wave = Uploader.waves[wave]; }
    Uploader.pause();
    if (wave && wave.backend.buffer) {
      Uploader.waves['playingWave'] = wave;
      wave.play();
    }
  },

  'pause': function() {
    var playingWave = Uploader.waves['playingWave'];
    if (playingWave) {
      playingWave.pause();
      Uploader.waves['playingWave'] = undefined;
    }
  },

  'markWaveStart': function(wave, position) {
    wave.mark({
      'id': 'start',
      'position': position || Uploader.getWavePosition(wave),
      'color': 'rgba(0, 255, 0, 0.8)'
    });
  },

  'markWaveEnd': function(wave, position) {
    wave.mark({
      'id': 'end',
      'position': position || Uploader.getWavePosition(wave),
      'color': 'rgba(255, 0, 0, 0.8)'
    });
  },

};
