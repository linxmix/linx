Modal = {

  // 
  // vars
  // 
  'queuedModals': [],

  //
  // functions
  //
  'close': function (e) {
    // reset modals
    console.log("resetting modals");
    Session.set("open_modal", undefined);
    Session.set("modal_wave", undefined);

    $('#songSelectModal').modal('hide');
    $('#transitionSelectModal').modal('hide');
    $('#songInfoModal').modal('hide');
    $('#transitionInfoModal').modal('hide');
    $('#songMatchModal').modal('hide');

    // if another modal is queued to open, do that
    var nextModal = Modal.queuedModals.shift();
    if (nextModal) {
      Modal.openModal(nextModal['name'], nextModal['waveId']);
    }
  },

  'openModal': function(name, waveId) {

    // if another modal is already open, queue this one to open next
    if (Session.get("open_modal") !== undefined) {
      return Modal.queuedModals.push({ 'name': name, 'waveId': waveId });
    }

    // set session variables
    Session.set("open_modal", name);
    Session.set("modal_wave", waveId);

    // modal-specific stuff
    var selector, closeOnEscape = false;
    switch (name) {

      case "song_select":
        selector = $('#songSelectModal');
        Session.set("song_search_query", "");
        closeOnEscape = true;
        break;

      case "transition_select":
        selector = $('#transitionSelectModal');
        Session.set("transition_search_query", "");
        closeOnEscape = true;
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

    // open new modal
    selector.modal({
      'show': true,
      'keyboard': closeOnEscape,
    });
  },

};

Template.songSelectModal.events({
  'click #loadSong': Uploader.loadSong,
});

Template.transitionSelectModal.events({
  'click #loadTransition': Uploader.loadTransition,
});

Template.songMatchModal.events({
  'click #submitSongMatch': Uploader.loadSong,
  'click #noSongMatch': Uploader.noSongMatch,
});

Template.songInfoModal.events({
  'click #submitSongInfo': Uploader.submitSongInfo,
});

Template.transitionInfoModal.events({
  'click #submitTransitionInfo': Uploader.submitTransitionInfo
});

Template.Modal.events({
  'click .close': Modal.close,
  'click .cancel': Modal.close,
  'keyup': submitOnEnterPress,
});

Template.songInfoModal.songName = function () {
  switch (Session.get("modal_wave")) {
    case 'startWave': return 'Starting Song';
    case 'endWave': return 'Ending Song';
    default: return '';
  }
}

Template.songMatches.songs = function () {
  return Session.get("song_matches");
};

// TODO: debug how to get this to work in modals that dont have forms
function submitOnEnterPress(e) {
  if (e.keyCode === 13) { // enter key

    switch (Session.get("open_modal")) {
      case "song_info":
        Uploader.submitSongInfo(e); break;
      case "transition_info":
        Uploader.submitTransitionInfo(e); break;
    };

  }
}