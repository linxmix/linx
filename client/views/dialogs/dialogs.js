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

  'openDialog': function(name, id) {

    // dialog-specific stuff
    var selector;
    switch (name) {

      case "song_select":
        selector = $('#songSelectDialog');
        Session.set("song_search_query", "");
        break;

      case "transition_select":
        selector = $('#transitionSelectDialog');
        Session.set("transition_search_query", "");
        break;

      case "song_info":
        Session.set("selected_song", undefined);
        selector = $('#songInfoDialog');
        break;

      case "transition_info":
        Session.set("selected_transition", undefined);
        selector = $('#transitionInfoDialog');
        break;

      case "song_match":
        Session.set("selected_song", undefined);
        selector = $('#songMatchDialog');
        break;

      default:
        return console.log("ERROR: openDialog called with Dialog of unknown name: "+name);
    }

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
  'click #loadSong': Uploader.loadSong,
});

Template.transitionSelectDialog.events({
  'click #loadTransition': Uploader.loadTransition,
});

Template.songMatchDialog.events({
  'click .submitSongMatch': Uploader.loadSong,
});

Template.songInfoDialog.events({
  'click #submitSongInfo': Uploader.submitSongInfo,
  'keyup': submitOnEnterPress,
});

Template.transitionInfoDialog.events({
  'click #submitTransitionInfo': Uploader.submitTransitionInfo,
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

function submitOnEnterPress(e) {
  if (e.keyCode === 13) { // enter key

    if (Session.equals("open_dialog", "song_info")) {
      Uploader.submitSongInfo(e);
    } else if (Session.equals("open_dialog", "transition_info")) {
      Uploader.submitTransitionInfo(e);
    }

  }
}