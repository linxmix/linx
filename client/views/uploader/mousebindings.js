//
// mouse events
//
Template.uploaderPage.events({

  // TODO: move these into button click event handler

  'click #loadSong': function (e) {
    uploaderLoadSong(e);
  },

  'click #submitSongInfo': function (e) {
    var wave = Uploader.waves['modalWaveOpen'];
    var serial = $('#songInfoDialog form').serializeArray();
    var name = serial[0]['value'];
    // hack to not accept empty names
    if (!name) {
      setTimeout(function () {
        $('#songInfoDialog').modal('show');
        Uploader.waves['modalWaveOpen'] = wave;
      }, 1500);
    }
    wave.song = {
      'isNew': true,
      'type': 'song',
      // TODO: make this based on given buffer's file name extension
      'fileType': 'mp3',
      'name': name,
      'playCount': 0
    };
  },

  'click .close': function (e) {
    Session.set("song_select_dialog", false);
    $('#songSelectDialog').modal('hide');
    $('#songInfoDialog').modal('hide');
    setTimeout(function () {
      Uploader.waves['modalWaveOpen'] = undefined;
    }, 1000);
  },

});

var mouseClickHeld = false;
Template.wave.events({

  //
  // click and drag
  //
  'mousedown': function (e) {
    mouseClickHeld = true;
  },

  'mouseup': function (e) {
    mouseClickHeld = false;
  },

  'mousemove canvas': function (e) {
    // click and drag
    if (mouseClickHeld) {
      // move track
    }
  },

  //
  // area clicks
  //
  'click .songLoadText': function (e) {
    Session.set("song_select_dialog", true);
    $('#songSelectDialog').modal('show');
    Uploader.waves['modalWaveOpen'] = Uploader.waves[this.id];
  },

  'click .waveform': function (e) {
    Uploader.waves['lastWaveClicked'] = this.id;
  },

  //
  // double click
  //
  'dblclick .waveform': function (e) {
    Uploader.playWave(this.id);
    e.preventDefault();
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
      zoomWave(this.id, zoom * direction);
    }
  },

});

function redrawWave(id) {
  var wave = Uploader.waves[id];
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

function clampZoom(wave, zoom) {
  var MAX_CANVAS_WIDTH = 32767; // current limit i found in google chrome
  var maxZoom = Math.floor(MAX_CANVAS_WIDTH / getWaveDuration(wave));
  if (zoom >= maxZoom) {
    return maxZoom;
  } else if (zoom <= 1) {
    return 1;
  } else {
    return zoom;
  }
}

function zoomWave(id, zoom) {
  var wave = Uploader.waves[id];
  wave.params['minPxPerSec'] = wave.drawer.params['minPxPerSec'] =
    clampZoom(wave, zoom + wave.params['minPxPerSec']);
  redrawWave(id);
}

// TODO: fix this global hack, it exists so double click on song can load that song
uploaderLoadSong = function (e) {
  var wave = Uploader.waves['modalWaveOpen'];
  $('.close').click(); // click is here so double click on song will close modal
  var song = Songs.findOne(Session.get("selected_song"));

  if (wave && song) {
    wave.song = song;
    wave.load(Mixer.getSampleUrl(song));
  }
};
