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
            wave.sample = {
              'type': 'song',
              // TODO: make this based on given buffer's file name extension
              'fileType': 'mp3',
              'name': track.title,
              'playCount': 0,
              'volume': 0.8,
              'title': track.title,
              'artist': track.artist,
              'bitrate': track.bitrate,
              'sampleRate': track.samplerate,
              'echoId': track.song_id,
              'md5': track.md5,
            };

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
    $(selector.find('form'))[0].reset(); // reset dialog's form
    Session.set("open_dialog", name);
    selector.modal('show');
    Uploader.waves['modalWaveOpen'] = Uploader.waves[id];
  },

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
      Uploader.waves['focus'] = wave.id;
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

  'loadSong': function (e) {
    var wave = Uploader.waves['modalWaveOpen'];
    $('.close').click(); // click is here so double click on song will close modal
    var song = Songs.findOne(Session.get("selected_song"));

    if (wave && song) {
      wave.sample = song;
      wave.hasMetadata = true;
      wave.load(Storage.getSampleUrl(song));
    }
  },

  'loadTransition': function (e) {
    var transitionWave = Uploader.waves['modalWaveOpen'];
    $('.close').click(); // click is here so double click on transition will close modal
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
      startWave.on('ready', function () {
        Uploader.markWaveEnd(startWave, transition.startSongEnd);
      });
      transitionWave.on('ready', function () {
        var startTime = transition.startTime || 0;
        var endTime = transition.endTime || Uploader.getWaveDuration(transitionWave);
        Uploader.markWaveStart(transitionWave, startTime);
        Uploader.markWaveEnd(transitionWave, endTime);
      });
      endWave.on('ready', function () {
        Uploader.markWaveStart(endWave, transition.endSongStart);
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

      // upload samples
      Storage.putSong(startWave);
      Storage.putSong(endWave);
      Storage.putTransition(startWave, transitionWave, endWave);
      alert("Transition upload initiated! Please leave your computer on for at least 10min so the server has a chance to get all the data!");
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