//
// mouse events
//
Template.wave.events({

  //
  // area clicks
  //
  'click .songLoadText': function (e) {
    Session.set("song_search_query", "");
    Uploader.openDialog($('#songSelectDialog'), "song_select", this.id);
  },

  'click .transitionLoadText': function (e) {
    Session.set("transition_search_query", "");
    Uploader.openDialog($('#transitionSelectDialog'), "transition_select", this.id);
  },

  //
  // double click
  //
  'dblclick .waveform': function (e) {
    Uploader.playWave(this.id);
    e.preventDefault();
  },

  //
  // hover
  //
  'mousemove .waveform': function(e) {
    var wave = Uploader.waves[this.id];
    Session.set("wave_focus", this.id);

    // only do this if we have a file buffer loaded
    if (wave.backend && wave.backend.buffer) {
      // extract mouse position from event
      var relX = 'offsetX' in e ? e.offsetX : e.layerX;
      var position = (relX / wave.drawer.scrollWidth) || 0;
      // scale percent to duration
      position *= Wave.getDuration(wave);
      // mark hover position
      Wave.markHover(wave, position);
    }
  },

  'click .wavePlayer': function(e) {
    Session.set("wave_focus", this.id);
  },

  'mouseout .waveform': function(e) {
    var wave = Uploader.waves[this.id];
    // only do this if we have a file buffer loaded
    if (wave.backend.buffer) {
      // clear hover marker
      Wave.markHover(wave, 0);
    }
  },

  //
  // scroll
  //
  'mousewheel .waveform': function (e) {
    // only do this if we have a file buffer loaded
    if (Uploader.waves[this.id].backend.buffer) {
      e.preventDefault();
      e.stopPropagation();
      var direction = e.wheelDelta >= 0 ? 1 : -1;
      var zoom = 1;
      if (e.shiftKey) {
        zoom *= 10;
      }
      zoomWave(this.id, zoom * direction, true);
    }
  },

});

//
// zoom stuff
//
Template.wavePlayer.rendered = function () {
  var id = this.data.id;
  var wave = Uploader.waves[id];

  // make sure only to run the init once
  if (wave.initialized) { return; }

  // set up volume slider
  var volumeSlider = $(this.find('.volumeSlider'));
  volumeSlider.slider({
    'min': 0,
    'max': this.data.isSongWave ? 1.0 : 1.25,
    'step': 0.01,
    'value': this.data.isSongWave ? 0.8 : 1.0,
  })
  .on('slide', function(ev) {
    wave.setVolume(ev.value);
  });

  // set up zoom slider
  var zoomSlider = $(this.find('.zoomSlider'));
  zoomSlider.slider({
    'min': 1,
    'max': 100,
    'step': 1,
    'handle': 'triangle',
  })
  .on('slide', function(ev) {
    zoomWave(id, ev.value);
  });
};

function zoomWave(id, percent, additive) {
  var wave = Uploader.waves[id];
  var lastPercent = wave.lastPercent || 5;
  if (additive) {
    percent += lastPercent;
  }

  // set bounds on zoom %
  if (percent > 100) {
    percent = 100;
  } else if (percent < 1) {
    percent = 1;
  }

  if (percent !== lastPercent) {
    wave.lastPercent = percent;
    // do zoom
    wave.params['minPxPerSec'] = wave.drawer.params['minPxPerSec'] =
      getZoomPx(wave, percent);
    // redraw wave
    redrawWave(id);
    // update zoomSlider
    $('#'+id+' .zoomSlider').slider('setValue', percent);
  }
}

function getZoomPx(wave, percent) {
  // find max zoom
  var MAX_CANVAS_WIDTH = 32767; // current limit in google chrome
  var maxZoom = Math.floor(MAX_CANVAS_WIDTH / Wave.getDuration(wave));
  // calculate px and return
  return (percent / 100.0) * maxZoom;
}

function redrawWave(id) {
  var wave = Uploader.waves[id];
  // redraw wave
  wave.drawBuffer();
  // update with and center screen on progress if wave is not playing
  var playingWave = Uploader.waves['playingWave'];
  if (!(playingWave && (playingWave['id'] === id))) {
    var hoverMarker = wave.markers['hover'];
    var progress = Wave.getProgress(wave) ||
      (hoverMarker && hoverMarker.percentage);
    wave.drawer.recenterOnPosition(~~(wave.drawer.scrollWidth * progress), true);
  }

  // update markers
  for (var waveId in wave.markers) {
    wave.drawer.addMark(wave.markers[waveId]);
  }
}
