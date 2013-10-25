Dialog = {

  'close': function (e) {
    Session.set("open_dialog", undefined);
    $('#songSelectDialog').modal('hide');
    $('#transitionSelectDialog').modal('hide');
    $('#songInfoDialog').modal('hide');
    $('#transitionInfoDialog').modal('hide');
    $('#songMatchDialog').modal('hide');
    Uploader.waves['modalWaveOpen'] = undefined;
  },

  'openDialog': function(selector, name, id) {
    Session.set("selected_song", undefined);
    Session.set("selected_transition", undefined);
    // reset dialog's form
    var form = $(selector.find('form'))[0];
    if (form) { form.reset(); }
    // close any previous dialog
    Dialog.close();
    Session.set("open_dialog", name);
    selector.modal('show');
    Uploader.waves['modalWaveOpen'] = Uploader.waves[id];
  },

};

Template.songSelectDialog.events({
  'click #loadSong': Uploader.loadSong
});

Template.transitionSelectDialog.events({
  'click #loadTransition': Uploader.loadTransition
});

Template.songMatchDialog.events({
  'click .submitSongMatch': Uploader.loadSong,
});

Template.songInfoDialog.events({
  'click #submitSongInfo': submitSongInfo,
  'keyup': submitOnEnterPress,
});

Template.transitionInfoDialog.events({
  'click #submitTransitionInfo': submitTransitionInfo,
  'keyup': submitOnEnterPress,
});

Template.Dialog.events({
  'click .close': Dialog.close,
  'click .cancel': Dialog.close,
});

/*Template.Dialog.rendered = function () {
  $('#songSelectDialog').on('hidden.bs.modal', Dialog.close);
  $('#transitionSelectDialog').on('hidden.bs.modal', Dialog.close);
  $('#songInfoDialog').on('hidden.bs.modal', Dialog.close);
  $('#transitionInfoDialog').on('hidden.bs.modal', Dialog.close);
  $('#songMatchDialog').on('hidden.bs.modal', Dialog.close);
};*/

Template.songMatches.songs = function () {
  return Session.get("song_matches");
};

function submitSongInfo(e) {
  var wave = Uploader.waves['modalWaveOpen'];
  Dialog.close(e);
  var serial = $('#songInfoDialog form').serializeArray();
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

    // TODO: how to handle songs we have that weren't ID'd?
    /*Meteor.call('searchEchoNest',
      { 'title': name || undefined, 'artist': artist || undefined },
      function (err, response) {
        if (err) { return console.log(err); }
        var songs = (response && response.songs);
        console.log(songs);

        // if there are echo nest matches, have user pick best match
        if (songs) {
          wave.sample = $.extend(wave.sample, {
            'title': songs[0].title,
            'artist': songs[0].artist_name,
            'echoId': songs[0].id
          });
        }

    });*/
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
    Dialog.openDialog($('#songMatchDialog'), "song_match", wave.id);
  }
  // couldn't find any possible matches in our database, so try to guess info
  else {
    wave.guessSample();
  }
}

function submitTransitionInfo(e) {
  var wave = Uploader.waves['modalWaveOpen'];
  Dialog.close(e); // click is here so that close is triggered
  var serial = $('#transitionInfoDialog form').serializeArray();
  var DJName = serial[0]['value'];
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