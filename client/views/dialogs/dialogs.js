Template.songSelectDialog.events({
  'click #loadSong': function (e) {
    uploaderLoadSong(e);
  }
});

Template.transitionSelectDialog.events({
  'click #loadTransition': function (e) {
    uploaderLoadTransition(e);
  }
});

Template.songInfoDialog.events({
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
      'type': 'song',
      // TODO: make this based on given buffer's file name extension
      'fileType': 'mp3',
      'name': name,
      'playCount': 0,
      'volume': 0.8
    };
    $('.close').click(); // click is here so that close is triggered
  },
});

Template.transitionInfoDialog.events({
  'click #submitTransitionInfo': function (e) {
    var wave = Uploader.waves['modalWaveOpen'];
    var serial = $('#transitionInfoDialog form').serializeArray();
    var DJName = serial[0]['value'];
    // hack to not accept empty names
    if (!DJName) {
      setTimeout(function () {
        $('#transitionInfoDialog').modal('show');
        Uploader.waves['modalWaveOpen'] = wave;
      }, 1500);
    }
    wave['dj'] = DJName;
    $('.close').click(); // click is here so that close is triggered
  },
});

Template.uploaderPage.events({
  'click .close': function (e) {
    Session.set("song_select_dialog", false);
    Session.set("transition_select_dialog", false);
    $('#songSelectDialog').modal('hide');
    $('#transitionSelectDialog').modal('hide');
    $('#songInfoDialog').modal('hide');
    $('#transitionInfoDialog').modal('hide');
    setTimeout(function () {
      Uploader.waves['modalWaveOpen'] = undefined;
    }, 1000);
  },
});