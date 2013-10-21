// TODO: fix these global hacks, it exists so double click on song can load that song
uploaderLoadSong = function (e) {
  var wave = Uploader.waves['modalWaveOpen'];
  $('.close').click(); // click is here so double click on song will close modal
  var song = Songs.findOne(Session.get("selected_song"));

  if (wave && song) {
    wave.song = song;
    wave.hasMetadata = true;
    wave.load(Mixer.getSampleUrl(song));
  }
};

uploaderLoadTransition = function (e) {
  var transitionWave = Uploader.waves['modalWaveOpen'];
  $('.close').click(); // click is here so double click on transition will close modal
  var transition = Transitions.findOne(Session.get("selected_transition"));

  if (transitionWave && transition) {
    // load transition
    transitionWave.transition = transition;
    transitionWave.hasMetadata = true;
    transitionWave.load(Mixer.getSampleUrl(transition));
    // load startWave
    var startSong = Songs.findOne(transition.startSong);
    var startWave = Uploader.waves['startWave'];
    startWave.song = startSong;
    startWave.hasMetadata = true;
    startWave.load(Mixer.getSampleUrl(startSong));
    // load endWave
    var endSong = Songs.findOne(transition.endSong);
    var endWave = Uploader.waves['endWave'];
    endWave.song = endSong;
    endWave.hasMetadata = true;
    endWave.load(Mixer.getSampleUrl(endSong));
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
};

Template.songSelectDialog.events({
  'click #loadSong': uploaderLoadSong
});

Template.transitionSelectDialog.events({
  'click #loadTransition': uploaderLoadTransition
});

Template.songInfoDialog.events({

  'click #submitSongInfo': submitSongInfo,
  'keyup': submitOnEnterPress,

});

Template.transitionInfoDialog.events({

  'click #submitTransitionInfo': submitTransitionInfo,
  'keyup': submitOnEnterPress,
  
});

Template.uploaderPage.events({
  'click .close': function (e) {
    Session.set("open_dialog", undefined);
    $('#songSelectDialog').modal('hide');
    $('#transitionSelectDialog').modal('hide');
    $('#songInfoDialog').modal('hide');
    $('#transitionInfoDialog').modal('hide');
    Meteor.setTimeout(function () {
      Uploader.waves['modalWaveOpen'] = undefined;
    }, 100);
  },
});

function submitSongInfo(e) {
  var wave = Uploader.waves['modalWaveOpen'];
  var serial = $('#songInfoDialog form').serializeArray();
  var name = serial[0]['value'];
  var artist = serial[1]['value'];
  $('.close').click(); // click is here so that close is triggered
  // hack to not accept empty names
  if (!name) {
    setTimeout(function () {
      Uploader.openDialog($('#songInfoDialog'), "song_info", wave.id);
    }, 1000);
  }

  wave.song = {
    'type': 'song',
    // TODO: make this based on given buffer's file name extension
    'fileType': 'mp3',
    'name': name,
    'title': name,
    'artist': artist,
    'playCount': 0,
    'volume': 0.8
  };

  // now see if user's song info can get us an echo nest match
  Meteor.call('searchEchoNest',
    { 'title': name, 'artist': artist },
    function (err, response) {
      if (err) { return console.log(err); }

      // recover track info
      // TODO: make it so user picks the right info
      var track = (response && response.songs[0]);
      if (track) {
        wave.song = $.extend(wave.song, {
          'title': track.title,
          'artist': track.artist_name,
          'echoId': track.id
        });
      }
  });
}

function submitTransitionInfo(e) {
  var wave = Uploader.waves['modalWaveOpen'];
  var serial = $('#transitionInfoDialog form').serializeArray();
  var DJName = serial[0]['value'];
  $('.close').click(); // click is here so that close is triggered
  // hack to not accept empty names
  if (!DJName) {
    setTimeout(function () {
      Uploader.openDialog($('#transitionInfoDialog'), "transition_info", wave.id);
    }, 1000);
  }
  wave['dj'] = DJName;
}

function submitOnEnterPress(e) {
  if (e.keyCode === 13) { // enter key

    if (Session.equals("open_dialog", "song_info")) {
      submitSongInfo(e);
    } else if (Session.equals("open_dialog", "transition_info")) {
      submitTransitionInfo(e);
    }

  }
}