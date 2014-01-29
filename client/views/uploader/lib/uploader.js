//
// init
//
var waveColors = {
  'startWave': 'mediumorchid',
  'transitionWave': 'steelblue',
  'endWave': 'coral'
};

var progressColors = {
  'startWave': 'purple',
  'transitionWave': 'darkblue',
  'endWave': 'orangered'
};

var cursorColors = {
  'startWave': 'navy',
  'transitionWave': 'navy',
  'endWave': 'navy'
};

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

  // hack to access the ArrayBuffer of audio data as it's read
  wave.loadBuffer = function (data) {
    var my = wave;
    wave.arrayBuffer = data;
    wave.pause();
    wave.backend.loadBuffer(data, function () {
      my.clearMarks();
      my.drawBuffer();
      my.fireEvent('ready');
    }, function () {
      my.fireEvent('error', 'Error decoding audio');
    });
  };
  // /hack

  // hack to make it so click only seeks on drag
  wave.createDrawer = function () {
    var my = wave;

    wave.drawer = Object.create(WaveSurfer.Drawer[wave.params.renderer]);
    wave.drawer.init(wave.params);

    wave.drawer.on('redraw', function () {
      my.drawBuffer();
    });

    // only seek if there was no click and drag
    wave.drawer.on('click', function (progress) {
      if (Uploader.movesMade < 3) {
        my.seekTo(progress);
      }
    });

    wave.on('progress', function (progress) {
      my.drawer.progress(progress);
    });
  };
  // /hack

  // hack to make marks more precise while waveform is present
  wave.bindMarks = function () {
    var my = wave;
    var prevTime = 0;

    wave.backend.on('play', function () {
      // Reset marker events
      Object.keys(my.markers).forEach(function (id) {
        my.markers[id].played = false;
      });
    });

    wave.backend.on('audioprocess', function (time) {
      Object.keys(my.markers).forEach(function (id) {
        var marker = my.markers[id];
        if (!marker.played) {
          if (marker.position <= time && marker.position >= prevTime) {
            // Prevent firing the event more than once per playback
            marker.played = true;

            my.fireEvent('mark', marker);
            marker.fireEvent('reached', time);
          }
        }
      });
      prevTime = time;
    });
  };
  // /hack
  wave.loadArrayBuffer = function(blob) {
    var my = wave;
    // Create file reader
    var reader = new FileReader();
    reader.addEventListener('progress', function (e) {
      my.onProgress(e);
    });
    reader.addEventListener('load', function (e) {
      wave.loadBuffer(e.target.result);
    });
    reader.addEventListener('error', function () {
      my.fireEvent('error', 'Error reading file');
    });
    reader.readAsArrayBuffer(blob);
  };
  // hack to add loadArrayBuffer method

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

Template.wave.focus = function () {
  var wave = Uploader.waves[this.id];
  var waveFocus = Session.equals("wave_focus", this.id);
  return waveFocus ? "wave-focus" : "";
};

Template.wave.rendered = function () {
  var id = this.data.id;
  var wave = Uploader.waves[id];
  var selector = '#'+id;
  var firstLoading = true,
      loadTextDiv = $(selector+' .loadText'),
      progressDiv = $(selector+' .progress'),
      progressBar = $(selector+' .progress-bar'),
      waveDiv = $(selector+' wave');

  // toggle progressDiv, waveDiv, and loadTextDiv appropriately
  var waveLoaded = (wave.backend && wave.backend.buffer);
  if (wave.currXhr) { // a wave is loading
    progressDiv.show();
    loadTextDiv.hide();
    waveDiv.hide();
  } else if (waveLoaded) { // a wave has been loaded
    progressDiv.hide();
    loadTextDiv.hide();
    waveDiv.show();
  } else { // no waves have been loaded
    progressDiv.hide();
    loadTextDiv.show();
    waveDiv.hide();
  }

  // make sure only to run the init once
  if (wave.initialized) { return; }
  wave.initialized = true;
  console.log("rendering wave: "+id);

  //
  // init wave
  //
  wave.init({
    'container': $(selector+' .waveform')[0],
    'waveColor': waveColors[id],
    'progressColor': progressColors[id],
    'cursorColor': cursorColors[id],
    'minPxPerSec': 10,
    'height': 197,
    'fillParent': false,
    'scrollParent': true,
    'cursorWidth': 2,
    'markerWidth': 2,
    'renderer': 'Canvas',
    'audioContext': audioContext
  });

  // bind drag n drop
  wave.bindDragNDrop($(selector+' .waveform')[0]);
  // reset wave on drop
  $(selector+' .waveform').on('drop', function (e) {
    console.log("resetting "+wave.id);
    wave.sample = undefined;
    wave.empty();
    Uploader.setWaveVolume(wave);
  });
  //
  // /init wave
  //

  //
  // progress bar
  //
  wave.on('loading', function(percent, xhr) {
    progressBar.css({ 'width': percent + '%' });

    // do stuff on first load
    if (firstLoading) {
      // refresh div pointers
      loadTextDiv = $(selector+' .loadText');
      progressDiv = $(selector+' .progress');
      progressBar = $(selector+' .progress-bar');
      waveDiv = $(selector+' wave');
      // hide load text, hide wave, show progress bar, set vars
      loadTextDiv.hide();
      waveDiv.hide();
      progressDiv.show();
      firstLoading = false;
      wave.currXhr = xhr;
      xhr.curr = true;
    }

    // if loading new xhr, cancel prev and update with new
    if (!xhr.curr) {
      wave.currXhr.abort();
      wave.currXhr = xhr;
      xhr.curr = true;
      console.log("aborting prev xhr");
    }
    
  });
  //
  // /progress bar
  //

  wave.on('ready', function() {
    // reset firstLoading status and currXhr
    firstLoading = true; wave.currXhr = undefined;
    // hide progress div
    progressDiv.hide();
    // show wave
    waveDiv.show();
    // enable overscroll on wave
    $(selector+' wave').first().overscroll({
      'captureWheel': false,
      'direction': 'horizontal',
    });
    // reset zoom
    Wave.zoom(wave, 5);
    // mark track end
    Wave.markTrackEnd(wave).on('reached', function() {
      // if this wave is still "playing", set to undefined because it's not.
      Meteor.setTimeout(function () {
        var playingWave = Uploader.waves['playing'];
        if ((playingWave && playingWave.id) === wave.id) {
          Uploader.waves['playing'] = undefined;
        }
      }, 200);
    });

    //
    // metadata
    //
    wave.sample = {
      'md5': Storage.calcMD5(wave.arrayBuffer),
      'duration': Wave.getDuration(wave),
    };

    // if dealing with samples of type song
    if (id !== 'transitionWave') {
      wave.sample['type'] = 'song';
      Storage.identifySample({
        'sample': wave.sample,
        'checkDB': true,
        'callback': function (sample) {
          console.log("callback with sample");
          console.log(sample);
          if (sample) { wave.sample = sample; }
          // if sample was unidentified, prompt user for metadata
          else { Modal.openModal('song_info', wave.id); }
        }
      });
    }

    // if dealing with samples of type transition
    else {
      wave.sample['type'] = 'transition';
      Storage.identifySample({
        'sample': wave.sample,
        'checkDB': true,
        'callback': function (sample) {
          if (sample) {
            wave.sample = sample;
            setupTransition(sample);
          }
          // if sample was unidentified, prompt user for metadata
          else { Modal.openModal('transition_info', wave.id); }
        }
      });
    }
    //
    // /metadata
    //

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
  'movesMade': 0,

  //
  // methods
  //
  'reset': function () {
    console.log("resetting uploader");
    // clear old waves
    Session.set("waves", []);
    // make new waves
    makeWave("startWave", "Drop starting song here", true);
    makeWave("transitionWave", "Drop new transition here", false);
    makeWave("endWave", "Drop ending song here", true);
    // set startWave as initial focus
    Session.set("wave_focus", "startWave");
  },

  'cycleFocus': function (magnitude) {
    var mapping = ['startWave', 'transitionWave', 'endWave'];
    // first find current wave
    var curr = mapping.indexOf(Session.get('wave_focus'));
    // then find next
    var next = (curr + magnitude) % 3;
    // hack because javascript sucks at mods with negative
    if (next < 0) { next = 2; }
    // update wave focus
    Session.set("wave_focus", mapping[next]);
    return mapping[next];
  },

  'playWave': function(wave) {
    // curry arg
    if (typeof wave !== 'object') { wave = Uploader.waves[wave]; }
    // pause any possible playing wave
    Uploader.pause();

    // if wave is loaded, play it and update playing/lastPlay
    if (wave && wave.backend.buffer) {
      Session.set("wave_focus", wave.id);
      Uploader.waves['playing'] = wave;
      wave.play();
    }
  },

  'pause': function() {
    var playingWave = Uploader.waves['playing'];
    if (playingWave) {
      playingWave.pause();
      Uploader.waves['playing'] = undefined;
    }
  },

  'markWaveEnd': function(wave, position) {
    position = position || Wave.getPosition(wave);
    Wave.clearMark(wave, 'end'); // clear old mark
    // when endMark is reached, cycle to next wave's startMark
    Wave.markEnd(wave, position).on('reached', function (time) {
      var prevWave = Uploader.waves['playing'];
      Session.set('wave_focus', prevWave.id);
      var nextWave = Uploader.waves[Uploader.cycleFocus(1)];
      var startPos = (nextWave.markers['start'] && nextWave.markers['start'].position);
      var lag = time - position;
      Wave.seekToPos(nextWave, startPos + lag);
      Uploader.playWave(nextWave);
      // seek previous wave to its marker position to account for lag
      Wave.seekToPos(prevWave, position);
    });
  },

  'submitSongInfo': function(e) {
    var wave = Uploader.waves[Session.get("modal_wave")];
    Modal.close(e);
    var serial = $('#songInfoModal form').serializeArray();
    var name = serial[0]['value'];
    var artist = serial[1]['value'];

    // update sample with submitted info
    $.extend(wave.sample, {
      'name': name,
      'title': name,
      'artist': artist,
    });

    // present match modal if we have any songs with similar info in our database
    var matches = Songs.find({ $or: [
      { 'name':  { $regex: name, $options: 'i' } },
      { 'artist':  { $regex: artist, $options: 'i' } }
    ]}).fetch();
    if (matches.length > 0) {
      Session.set("song_matches", matches);
      Modal.openModal("song_match", wave.id);
    }
  },

  'submitTransitionInfo': function(e) {
    var wave = Uploader.waves[Session.get("modal_wave")];
    Modal.close(e); // click is here so that close is triggered
    var serial = $('#transitionInfoModal form').serializeArray();
    var DJName = serial[0]['value'];

    // update sample with submitted info
    $.extend(wave.sample, {
      'dj': DJName,
    });
  },

  'loadSong': function (e) {
    var wave = Uploader.waves[Session.get("modal_wave")];
    Modal.close(e); // click is here so double click on song will close modal
    var song = Songs.findOne(Session.get("selected_song"));
    Uploader.loadWave(wave, song);
  },

  'loadTransition': function (e) {
    var wave = Uploader.waves[Session.get("modal_wave")];
    Modal.close(e); // click is here so double click on transition will close modal
    var transition = Transitions.findOne(Session.get("selected_transition"));
    Uploader.loadWave(wave, transition, transition.volume);
  },

  // loads given sample into given wave
  'loadWave': function (wave, sample, volume) {
    if (wave && sample) {
      // load sample
      wave.load(Storage.getSampleUrl(sample));
      // set volume
      Uploader.setWaveVolume(wave, volume);
    }
    else {
      console.log("WARNING: loadWave given an invalid arg.");
    }
  },

  'setWaveVolume': function (wave, volume) {
    volume = volume || ((wave.id === 'transitionWave') ? 1.0 : 0.8);
    wave.setVolume(volume);
    // update slider
    $('#'+wave.id+' .volumeSlider').slider('setValue', volume);
  },

  'upload': function(e) {
    var startWave = Uploader.waves['startWave'];
    var transitionWave = Uploader.waves['transitionWave'];
    var endWave = Uploader.waves['endWave'];

    // pause uploader
    Uploader.pause();

    // make sure this transition is valid before uploading
    validateUpload(startWave, transitionWave, endWave, function () {
      Session.set("uploads_in_progress", 3); // TODO: move this out of here

      // function to call on upload completion
      // TODO: debug why data is always undefined
      function putComplete(err, data) {
        var uploadsInProgress = Session.get("uploads_in_progress");
        Session.set("uploads_in_progress", --uploadsInProgress);
        if (err) { return alert(err); }
        console.log("one upload completed. remaining uploads: " +
          Math.max(uploadsInProgress, 0));
        if (uploadsInProgress <= 0) {
          Uploader.redirectToUploader();
          alert('Upload successfully completed!');
        }
      }

      // update transitionWave.sample with volumes before redirecting
      $.extend(transitionWave.sample, {
        'startSongVolume': $('#startWave .volumeSlider').data('slider').getValue(),
        'endSongVolume': $('#endWave .volumeSlider').data('slider').getValue(),
        'volume': $('#transitionWave .volumeSlider').data('slider').getValue()
      });

      // send client to loading page
      Uploader.redirectToLoading();

      // synchronously upload samples, signaling completion on each callback
      Storage.putSong(startWave, function () {
        putComplete();
        Storage.putSong(endWave, function () {
          putComplete();
          Storage.putTransition(startWave, transitionWave, endWave, putComplete);
        });
      });
    });
  },

};

function validateUpload(startWave, transitionWave, endWave, callback) {

  // 1. check user is logged in
  if (!Meteor.userId()) {
    return alert("Sorry, but you must be logged in to submit a transition!");
  }

  // 2. check not currently doing an upload
  if (Session.get("uploads_in_progress") > 0) {
    return alert("Another upload is already in progress!");
  }

  // 3. check waves are loaded and marked
  var validWaves = true;
  // check buffers are loaded
  if (!(startWave.backend.buffer &&
    transitionWave.backend.buffer &&
    endWave.backend.buffer)) {
    validWaves = false;
  // check markers are present
  } else if (!(startWave.markers['end'] &&
    transitionWave.markers['start'] &&
    transitionWave.markers['end'] &&
    endWave.markers['start'])) {
    validWaves = false;
  }
  if (!validWaves) {
    return alert("All three waves must be loaded and marked before submission.");
  }

  // 4. if transition has a mongo id, check it corresponds to these songs
  var transition = transitionWave.sample;
  var startSong = startWave.sample;
  var endSong = endWave.sample;
  if (transition && transition._id) {
    if ((transition.startSong !== (startSong && startSong._id)) ||
      (transition.endSong !== (endSong && endSong._id))) {
      return alert("What? The database says this transition doesn't fit these songs!");
    }
  }

  return callback();
}

function setupTransition(transition) {

  // load and mark startWave
  var startSong = Songs.findOne(transition.startSong);
  var startWave = Uploader.waves['startWave'];
  startWave.once('ready', function () {
    Uploader.markWaveEnd(startWave,
      (transitionWave.sample.startSongEnd));
  });
  Uploader.loadWave(startWave, startSong, transition.startSongVolume);

  // load and mark endWave
  var endSong = Songs.findOne(transition.endSong);
  var endWave = Uploader.waves['endWave'];
  endWave.once('ready', function () {
    Wave.markStart(endWave,
      (transitionWave.sample && transitionWave.sample.endSongStart));
  });
  Uploader.loadWave(endWave, endSong, transition.endSongVolume);

  // mark transitionWave
  var transitionWave = Uploader.waves['transitionWave'];
  var startTime = transition.startTime || 0;
  var endTime = transition.endTime || Wave.getDuration(transitionWave);
  Wave.markStart(transitionWave, startTime);
  Uploader.markWaveEnd(transitionWave, endTime);
}