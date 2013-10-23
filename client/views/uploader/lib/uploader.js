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

  // set startWave as initial focus
  Session.set("wave_focus", "startWave");

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
  var waveFocused = Session.equals("wave_focus", this.id);
  return waveFocused ? "wave-focus" : "";
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

  // toggle progressDiv and loadTextDiv appropriately
  if (!wave.currXhr) { progressDiv.hide(); }
  var waveLoaded = wave.backend && wave.backend.buffer;
  if (waveLoaded || wave.currXhr) { loadTextDiv.hide(); }

  // make sure only to run the init once
  if (wave.initialized) { return console.log("stopped wave rerender: "+wave.id); }
  wave.initialized = true;
  console.log("rendering wave: "+id);

  // first handle id-specific stuff
  switch (id) {

    // when a mark is reached, pause this and play transitionWave
    case 'startWave':
    wave.on('mark', function(mark) {
      if (mark.id === 'end') {
        var transitionWave = Uploader.waves['transitionWave'];
        var transitionStart =
          (transitionWave.markers['start'].position) /
          Wave.getDuration(transitionWave);
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
          Wave.getDuration(endWave);
        endWave.seekTo(endStart);
        Uploader.playWave(endWave);
      }
    }); break;

  }

  // init wave
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
  });

  // progress bar
  waveDiv.hide();
  loadTextDiv.show();
  wave.on('loading', function(percent, xhr) {
    progressBar.css({ 'width': percent + '%' });

    // do stuff on first load
    if (firstLoading) {
      // hide load text, hide wave, show progress bar, set vars
      loadTextDiv.hide();
      waveDiv.hide();
      progressDiv.show();
      firstLoading = false;
      wave.currXhr = xhr;
      xhr.curr = true;
    }

    // TODO: figure out how to reset metadata
    // if loading new xhr, cancel prev and update with new
    if (!xhr.curr) {
      wave.currXhr.abort();
      wave.currXhr = xhr;
      xhr.curr = true;
      console.log("aborting prev xhr");
    }
    
  });

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
      'hoverThumbs': true,
    });

    // if wave has no song, it must have been drag and drop
    // => get the metadata
    if (!wave.hasMetadata && (id !== 'transitionWave')) {

      // compute md5  
      var spark = new SparkMD5.ArrayBuffer();
      spark.append(wave.arrayBuffer);
      var md5String = spark.end();
      wave['md5'] = md5String;

      // if we have this song in our database, use that
      var song = Songs.findOne({'md5': md5String});
      if (song) {
        wave.sample = song;
      }

      // otherwise, try echo nest
      else {
        Meteor.call('identifySong', { 'md5': md5String }, function(err, response) {
          if (err) { return console.log(err); }

          // recover track info
          var track = (response && response.track);
          console.log(track);
          if (track) {
            wave.sample = Storage.makeSong({
              'name': track.title,
              'title': track.title,
              'artist': track.artist,
              'bitrate': track.bitrate,
              'sampleRate': track.samplerate,
              'echoId': track.song_id,
              'md5': track.md5,
              'duration': Wave.getDuration(wave),
            });

          // echonest attempt failed, so prompt the user to get the metadata
          } else {
            Uploader.openDialog($('#songInfoDialog'), "song_info", id);
          }

        });
      }
    } // /identify song

    // if transition has no sample, it must be new
    // => so prompt the user to get the metadata
    if (!wave.hasMetadata && (id === 'transitionWave')) {
      Uploader.openDialog($('#transitionInfoDialog'), "transition_info", id);
    }

    // reset hasMetadata in case new file is loaded after this
    wave.hasMetadata = false;

    // set volume and volume slider
    var sample = wave.sample;
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

  'openDialog': function(selector, name, id) {
    Session.set("selected_song", undefined);
    Session.set("selected_transition", undefined);
    // reset dialog's form
    var form = $(selector.find('form'))[0];
    if (form) { form.reset(); }
    Session.set("open_dialog", name);
    selector.modal('show');
    Uploader.waves['modalWaveOpen'] = Uploader.waves[id];
  },

  'playWave': function(wave) {
    // curry arg
    if (typeof wave !== 'object') { wave = Uploader.waves[wave]; }
    Uploader.pause();
    if (wave && wave.backend.buffer) {
      Session.set("wave_focus", wave.id);
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

  'loadSong': function (e) {
    var wave = Uploader.waves['modalWaveOpen'];
    Dialog.close(e); // click is here so double click on song will close modal
    var song = Songs.findOne(Session.get("selected_song"));

    // if wave and song exist, load song and tie song to wave
    if (wave && song) {
      wave.sample = song;
      wave.hasMetadata = true;
      wave.load(Storage.getSampleUrl(song));
    }
    // otherwise, try to fill in missing information
    else if (wave && wave.guessSample) {
      wave.guessSample();
    }
    else {
      console.log("WARNING: loadSong didn't load metadata");
    }
  },

  'loadTransition': function (e) {
    var transitionWave = Uploader.waves['modalWaveOpen'];
    Dialog.close(e); // click is here so double click on transition will close modal
    var transition = Transitions.findOne(Session.get("selected_transition"));

    if (transitionWave && transition) {
      // load transition
      transitionWave.sample = transition;
      transitionWave.hasMetadata = true;
      transitionWave.load(Storage.getSampleUrl(transition));
      // load startWave
      var startSong = Songs.findOne(transition.startSong);
      var startWave = Uploader.waves['startWave'];
      startWave.sample = startSong;
      startWave.hasMetadata = true;
      startWave.load(Storage.getSampleUrl(startSong));
      // load endWave
      var endSong = Songs.findOne(transition.endSong);
      var endWave = Uploader.waves['endWave'];
      endWave.sample = endSong;
      endWave.hasMetadata = true;
      endWave.load(Storage.getSampleUrl(endSong));
      // mark waves
      startWave.once('ready', function () {
        Wave.markEnd(startWave, transition.startSongEnd);
      });
      transitionWave.once('ready', function () {
        var startTime = transition.startTime || 0;
        var endTime = transition.endTime || Wave.getDuration(transitionWave);
        Wave.markStart(transitionWave, startTime);
        Wave.markEnd(transitionWave, endTime);
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

      // update volumes
      startWave.sample.volume = $('#startWave .volumeSlider').data('slider').getValue();
      endWave.sample.volume = $('#endWave .volumeSlider').data('slider').getValue();

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
      alert("Upload initiated! Please DO NOT leave this page until you get confirmation that the upload has completed.");

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
  // check user is logged in
  if (!Meteor.userId()) {
    return alert("Sorry, but you must be logged in to submit a transition!");
  }
  // check not currently doing an upload
  if (Storage.uploadsInProgress > 0) {
    return alert("Another upload is already in progress!");
  }
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

  // finally, make sure songs don't already exist on s3
 /* Meteor.call('getList', 'songs/', function (err, data) {
    if (err) { return console.log(err); }
    var startUrl = Storage.getSampleUrl(startWave.sample, true);
    var endUrl = Storage.getSampleUrl(endWave.sample, true);
    var urlList = data.Contents.map(function (listItem) {
      return listItem.Key;
    });

    // function to check to see if value exists in array
    function isInArray(value, array) {
      return array.indexOf(value) > -1 ? true : false;
    }

    var alertStart = 'Hmmm... this ';
    var alertMiddle;
    var alertEnd = ' already exists on our cloud server! Please let Daniel (wolfbiter@gmail.com) know what you were uploading so he can help you sort out this issue!';
    if (!startWave.sample._id && isInArray(startUrl, urlList)) {
      alertMiddle = "starting song";
    }
    else if (!endWave.sample._id && isInArray(endUrl, urlList)) {
      alertMiddle = "ending song";
    }

    if (alertMiddle) {
      return alert(alertStart + alertMiddle + alertEnd);
    } else {
      return callback();
    }

  });*/

}