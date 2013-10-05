Session.set("waves", []);

var waves = {};
var lastWaveClicked, lastMarkMade, modalWaveOpen;

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
  makeWave("startWave", "Drop starting song here.", true);
  makeWave("transitionWave", "Drop transition here.", false);
  makeWave("endWave", "Drop ending song here.", true);

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
    $(selector+' .loadText').hide();

    // if wave has no song, it must been drag and drop
    // => so prompt the user to get the metadata
    if (!wave.song && (id !== 'transitionWave')) {
      $('#songInfoDialog').modal('show');
      modalWaveOpen = waves[id];
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

function clampZoom(zoom) {
  if (zoom >= 59) {
    return 59;
  } else if (zoom <= 1) {
    return 1;
  } else {
    return zoom;
  }
}

function zoomWave(id, zoom) {
  var wave = waves[id];
  zoom = clampZoom(zoom + wave.params['minPxPerSec']);
  wave.params['minPxPerSec'] = zoom;
  wave.drawer.params['minPxPerSec'] = zoom;
  redrawWave(id);
}


//
// Play and Pause
//
var playingWave;

function playWave(newWave) {
  // curry arg
  if (typeof newWave !== 'object') { newWave = waves[newWave]; }
  var prevWave = playingWave;
  pause();
  // play given wave if it wasnt the one playing
  if ((prevWave && prevWave.id) !== newWave.id) {
    playingWave = newWave;
    (newWave && newWave.play());
  }
}

function pause() {
  if (playingWave) {
    playingWave.pause();
    playingWave = undefined;
  }
}

// TODO: fix this global hack, it exists so double click on song can load that song
uploaderLoadSong = function (e) {
  var wave = modalWaveOpen;
  $('.close').click(); // click is here so double click on song will close modal
  var song = Songs.findOne(Session.get("selected_song"));

  if (wave && song) {
    wave.song = song;
    wave.load(Mixer.getSampleUrl(song));
  }
};

//
// mouse events
//
Template.uploaderPage.events({

  // TODO: move these into button click event handler

  'drop': function(e) {
    // store raw data of any dropped files
    waves[this.id].data = e.dataTransfer.files[0];
    console.log(waves[this.id].data);
  },

  'click #loadSong': function (e) {
    uploaderLoadSong(e);
  },

  'click #submitSongInfo': function (e) {
    var wave = modalWaveOpen;
    var serial = $('#songInfoDialog form').serializeArray();
    var name = serial[0]['value'];
    // hack to not accept empty names
    if (!name) {
      setTimeout(function () {
        $('#songInfoDialog').modal('show');
        modalWaveOpen = wave;
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
      modalWaveOpen = undefined;
    }, 1000);
  },

  'click button': function (e) {
    var action = e.target.dataset && e.target.dataset.action;
    // pass click to event handlers
    if (action && action in eventHandlers) {
      eventHandlers[action](e);
    }
  }

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
  // click
  //
  'click .songLoadText': function (e) {
    Session.set("song_select_dialog", true);
    $('#songSelectDialog').modal('show');
    modalWaveOpen = waves[this.id];
  },

  'click .waveform': function (e) {
    lastWaveClicked = this.id;
  },

  //
  // scroll
  //
  'mousewheel .waveform': function (e) {
    // only do this if we have a file buffer loaded
    if (waves[this.id].backend.buffer) {
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

  //
  // double click
  //
  'dblclick .waveform': function (e) {
    playWave(this.id);
    e.preventDefault();
  },

});

//
// key events
//
var keyBindingsInterval = Meteor.setInterval(function(){
   if (Meteor.Keybindings) {
     Meteor.clearInterval(keyBindingsInterval);
     addKeyBindings();
   }
}, 500);

function addKeyBindings() {
  Meteor.Keybindings.add({
    'space': eventHandlers['playPause'],
    'left': eventHandlers['markStart'],
    'right': eventHandlers['markEnd'],
    'down/shift+down': eventHandlers['back'],
    'up/shift+up': eventHandlers['forth']
  });
}

//
// event handlers
//
var eventHandlers = {

  'playPause': function(e) {
    if (!modalWaveOpen) {
      e.preventDefault();
      // we want spacebar to be a universal pause
      if (playingWave) {
        pause();
      } else {
        playWave(lastWaveClicked);
      }
    }
  },

  'markStart': function(e) {
    e.preventDefault();
    lastMarkMade = waves[lastWaveClicked].mark({
      id: 'start',
      color: 'rgba(0, 255, 0, 0.8)'
    });
  },

  'markEnd': function(e) {
    e.preventDefault();
    lastMarkMade = waves[lastWaveClicked].mark({
      id: 'end',
      color: 'rgba(255, 0, 0, 0.8)'
    });
  },

  'back': function(e) {
    e.preventDefault();
    var dist = -0.005;
    if (e.shiftKey) {
       dist *= 50;
    }
    waves[lastWaveClicked].skip(dist);
  },

  'forth': function(e) {
    e.preventDefault();
    var dist = 0.005;
    if (e.shiftKey) {
       dist *= 50;
    }
    waves[lastWaveClicked].skip(dist);
  },

  'upload': function(e) {

    // userId check
    if (!Meteor.userId()) {
      return alert("Sorry, but you must be logged in to submit a transition!");
    }

    // validation check
    // TODO: add marker checks to this validation!
    //for (var waveId in waves) {
    //  if (!waves[waveId].backend.buffer) {
    //    return alert("All three waves must be loaded and marked before submitting.");
    //  }
    //}

    // upload any new songs and upload transition
    var startWave = waves['startWave'];
    var transitionWave = waves['transitionWave'];
    var endWave = waves['endWave'];
    if (startWave.song.isNew) {
      uploadSongWave(startWave);
    }
    if (endWave.song.isNew) {
      uploadSongWave(endWave);
    }
    uploadTransitionWave(transitionWave, startWave, endWave);
  }
};

function uploadTransitionWave(transitionWave, startWave, endWave) {
  var startSongEnd = startWave.markers['end'].position;
  var endSongStart = endWave.markers['start'].position;

  var startTime = transitionWave.markers['start'].position;
  var endTime = transitionWave.markers['end'].position;

  var startSong = Songs.findOne({ 'name': startWave.song.name });
  var endSong = Songs.findOne({ 'name': endWave.song.name });

  // add transition to database
  var transition = {
    'type': 'transition',
    'transitionType': 'active',
    // TODO: make this based on given buffer's file name extension
    'fileType': 'mp3',
    'startSong': startSong._id,
    'startSongEnd': startSongEnd,
    'endSong': endSong._id,
    'endSongStart': endSongStart,
    'startTime': startTime,
    'endTime': endTime
  };
  //Transitions.insert(transition);

  // upload transition to s3 server
  var url = Mixer.getSampleUrl(transition);
  uploadWave(transitionWave, url);
}

function uploadSongWave(wave) {
  // add song to database
  //Songs.insert(wave.song);
  // upload song to s3 server
  var url = Mixer.getSampleUrl(wave.song);
  uploadWave(wave, url);
}

// uploads buffer of given wave to given s3 url
function uploadWave(wave, url) {
  console.log(wave.bufferData);
  //Meteor.call('putStream', wave.bufferData, 'test.mp3');
}
