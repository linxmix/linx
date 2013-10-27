Modal = {

  'close': function (e) {
    Session.set("open_modal", undefined);
    $('#songSelectModal').modal('hide');
    $('#transitionSelectModal').modal('hide');
    $('#songInfoModal').modal('hide');
    $('#transitionInfoModal').modal('hide');
    $('#songMatchModal').modal('hide');
    Uploader.waves['modalWaveOpen'] = undefined;
  },

  'openModal': function(name, id) {

    // modal-specific stuff
    var selector;
    switch (name) {

      case "song_select":
        selector = $('#songSelectModal');
        Session.set("song_search_query", "");
        break;

      case "transition_select":
        selector = $('#transitionSelectModal');
        Session.set("transition_search_query", "");
        break;

      case "song_info":
        Session.set("selected_song", undefined);
        selector = $('#songInfoModal');
        break;

      case "transition_info":
        Session.set("selected_transition", undefined);
        selector = $('#transitionInfoModal');
        break;

      case "song_match":
        Session.set("selected_song", undefined);
        selector = $('#songMatchModal');
        break;

      default:
        return console.log("ERROR: openModal called with Modal of unknown name: "+name);
    }

    // reset modal's form
    var form = $(selector.find('form'))[0];
    if (form) { form.reset(); }
    // close any previous modal
    Modal.close();
    Session.set("open_modal", name);
    selector.modal('show');
    Uploader.waves['modalWaveOpen'] = Uploader.waves[id];
  },

};

Template.songSelectModal.events({
  'click #loadSong': Uploader.loadSong,
});

Template.transitionSelectModal.events({
  'click #loadTransition': Uploader.loadTransition,
});

Template.songMatchModal.events({
  'click .submitSongMatch': Uploader.loadSong,
});

Template.songInfoModal.events({
  'click #submitSongInfo': Uploader.submitSongInfo,
  'keyup': submitOnEnterPress,
});

Template.transitionInfoModal.events({
  'click #submitTransitionInfo': Uploader.submitTransitionInfo,
  'keyup': submitOnEnterPress,
});

Template.Modal.events({
  'click .close': Modal.close,
  'click .cancel': Modal.close,
});

/*Template.Modal.rendered = function () {
  $('#songSelectModal').on('hidden.bs.modal', Modal.close);
  $('#transitionSelectModal').on('hidden.bs.modal', Modal.close);
  $('#songInfoModal').on('hidden.bs.modal', Modal.close);
  $('#transitionInfoModal').on('hidden.bs.modal', Modal.close);
  $('#songMatchModal').on('hidden.bs.modal', Modal.close);
};*/

Template.songMatches.songs = function () {
  return Session.get("song_matches");
};

function submitOnEnterPress(e) {
  if (e.keyCode === 13) { // enter key

    if (Session.equals("open_modal", "song_info")) {
      Uploader.submitSongInfo(e);
    } else if (Session.equals("open_modal", "transition_info")) {
      Uploader.submitTransitionInfo(e);
    }

  }
}