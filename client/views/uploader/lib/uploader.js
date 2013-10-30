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
  // reset wave metadata on drop
  $(selector+' .waveform').on('drop', function (e) {
    console.log("resetting "+wave.id+"'s metadata");
    wave.hasMetadata = false;
    wave.sample = undefined;
    wave.empty();
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
      Uploader.waves['playing'] = undefined;
    });

    //
    // metadata
    //
    if (!wave.hasMetadata) {

      // tell storage to identify sample based on sample type
      if (id !== 'transitionWave') {
        Storage.identifyWave(wave, 'song');
      } else {
        Storage.identifyWave(wave, 'transition');
      }

      // TODO move and/or change this to be more cleanly logical!
      // since wave had no metadata, set volume to default
      var volume = (wave.id === 'transitionWave') ? 1.0 : 0.8;
      // update volume and slider
      wave.setVolume(volume);
      $(selector+' .volumeSlider').slider('setValue', volume);
    }

    // reset hasMetadata at end in case new file is loaded after this
    wave.hasMetadata = false;
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
    // when end mark is reached, cycle to next wave's startMark
    Wave.markEnd(wave, position).on('reached', function () {
      Uploader.cycleFocus(1);
      var nextWave = Uploader.waves[Session.get('wave_focus')];
      var startPos = (nextWave.markers['start'] && nextWave.markers['start'].position);
      nextWave.seekTo(startPos / Wave.getDuration(nextWave));
      Uploader.playWave(nextWave);
    });
  },

  // submit song info on song info modal close
  'submitSongInfo': function(e) {
    var wave = Uploader.waves[Session.get("modal_wave")];
    Modal.close(e);
    var serial = $('#songInfoModal form').serializeArray();
    var name = serial[0]['value'];
    var artist = serial[1]['value'];

    wave.guessSample = function() {
      wave.sample = Storage.makeSong({
        'name': name,
        'title': name,
        'artist': artist,
        'md5': wave.md5,
        'duration': Wave.getDuration(wave),
      });
    };

    //
    // use user-provided info to attempt to ID song
    //
    var songs = Songs.find({ $or: [
      { 'name':  { $regex: name, $options: 'i' } },
      { 'artist':  { $regex: artist, $options: 'i' } }
    ]}).fetch();
    // first see if we have any songs like this one in our database
    if (songs.length > 0) {
      Session.set("song_matches", songs);
      Modal.openModal("song_match", wave.id);
    }
    // couldn't find any possible matches in our database, so try to guess info
    else {
      wave.guessSample();
    }
  },

  // submit transition info on transition info modal close
  'submitTransitionInfo': function(e) {
    var wave = Uploader.waves[Session.get("modal_wave")];
    Modal.close(e); // click is here so that close is triggered
    var serial = $('#transitionInfoModal form').serializeArray();
    var DJName = serial[0]['value'];
    wave['dj'] = DJName;
  },

  'loadSong': function (e) {
    var wave = Uploader.waves[Session.get("modal_wave")];
    Modal.close(e); // click is here so double click on song will close modal
    var song = Songs.findOne(Session.get("selected_song"));

    // if wave and song exist, load song and tie song to wave
    if (wave && song) {
      wave.sample = song;
      wave.hasMetadata = true;
      wave.load(Storage.getSampleUrl(song));
    }
    else {
      console.log("WARNING: loadSong didn't load metadata");
    }
  },

  // no match was found, fill in missing information
  'noSongMatch': function (e) {
    var wave = Uploader.waves[Session.get("modal_wave")];
    Modal.close(e); // click is here so double click on song will close modal
    if (wave && wave.guessSample) {
      wave.guessSample();
    }
  },

  'loadTransition': function (e) {
    var transitionWave = Uploader.waves[Session.get("modal_wave")];
    Modal.close(e); // click is here so double click on transition will close modal
    var transition = Transitions.findOne(Session.get("selected_transition"));

    function loadWave(wave, sample, volume, url) {
      wave.sample = sample;
      wave.hasMetadata = true;
      // update volume and slider
      wave.setVolume(volume);
      $('#'+wave.id+' .volumeSlider').slider('setValue', volume);
      // load file
      wave.load(url);
    }

    if (transitionWave && transition) {

      // load transition
      loadWave(transitionWave, transition, transition.volume,
        Storage.getSampleUrl(transition));

      // load startWave
      var startSong = Songs.findOne(transition.startSong);
      var startWave = Uploader.waves['startWave'];
      loadWave(startWave, startSong,
        transition.startSongVolume,
        Storage.getSampleUrl(startSong));

      // load endWave
      var endSong = Songs.findOne(transition.endSong);
      var endWave = Uploader.waves['endWave'];
      loadWave(endWave, endSong,
        transition.endSongVolume,
        Storage.getSampleUrl(endSong));

      // mark waves
      startWave.once('ready', function () {
        Uploader.markWaveEnd(startWave, transition.startSongEnd);
      });
      transitionWave.once('ready', function () {
        var startTime = transition.startTime || 0;
        var endTime = transition.endTime || Wave.getDuration(transitionWave);
        Wave.markStart(transitionWave, startTime);
        Uploader.markWaveEnd(transitionWave, endTime);
      });
      endWave.once('ready', function () {
        Wave.markStart(endWave, transition.endSongStart);
      });
    }
  },

  'upload': function(e) {
    var startWave = Uploader.waves['startWave'];
    var transitionWave = Uploader.waves['transitionWave'];
    var endWave = Uploader.waves['endWave'];

    // pause uploader
    Uploader.pause();

    // make sure this transition is valid before uploading
    validateUpload(startWave, transitionWave, endWave, function () {

      // function to call on upload completion
      // TODO: debug why data is always undefined
      function putComplete(err, data) {
        --Storage.uploadsInProgress;
        if (err) { return alert(err); }
        console.log("one upload completed. remaining uploads: " +
          Math.max(Storage.uploadsInProgress, 0));
        if (Storage.uploadsInProgress <= 0) {
          Storage.uploadsInProgress = 0;
          alert('Upload successfully completed!');
        }
      }

      // tell user to wait for completion of uploads
      alert("Upload initiated! Please close this, but DO NOT leave this page until you get confirmation that the upload has completed.");

      // synchronously upload samples, signaling completion on each callback
      Storage.uploadsInProgress = 3; // TODO: move this out of here
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

  //
  // validation check
  // 

  // 1. check user is logged in
  if (!Meteor.userId()) {
    return alert("Sorry, but you must be logged in to submit a transition!");
  }

  // 2. check not currently doing an upload
  if (Storage.uploadsInProgress > 0) {
    return alert("Another upload is already in progress!");
  }

  // 3. if transition has a mongo id, check it corresponds to these songs
  var transition = transitionWave.sample;
  var startSong = startWave.sample;
  var endSong = endWave.sample;
  if (transition && transition._id) {
    if ((transition.startSong !== (startSong && startSong._id)) ||
      (transition.endSong !== (endSong && endSong._id))) {
      return alert("What? The database says this transition doesn't fit these songs!");
    }
  }

  // 4. check waves are loaded and marked
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

  //
  // /validation
  //
  return callback();
}