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
    $('#djSelectModal').modal('hide');

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

      case "dj_select":
        Session.set("selected_dj", undefined);
        selector = $('#djSelectModal');
        break;

      default:
        return console.log("ERROR: openModal called with Modal of unknown name: "+name);
    }

    // reset modal's form
    var form = $(selector.find('form'))[0];
    if (form) { form.reset(); }

    // open new modal
    Session.set("open_modal", name);
    Session.set("modal_wave", waveId);
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
});

Template.songInfoModal.events({
  'click #submitSongInfo': Uploader.submitSongInfo,
});

Template.transitionInfoModal.events({
  'click #submitTransitionInfo': Uploader.submitTransitionInfo,
});

Template.djSelectModal.events({
  'click #selectDJ': selectDJ,
});

Template.Modal.events({
  'click .close': Modal.close,
  'click .cancel': Modal.close,
  'keyup': submitOnEnterPress,
});

Template.songInfoModal.waveName = function () {
  switch (Session.get("modal_wave")) {
    case 'startWave': return 'starting song';
    case 'endWave': return 'ending song';
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

//
// DJ Select Stuff
//

Template.dj.events({
  'click': function(e) {
    Session.set("selected_dj", this.dj);
  },
  'dblclick': function(e) {
    Session.set("selected_dj", this.dj);
    selectDJ(e);
    Modal.close(e); // click is here so double click on dj will close modal
  },
});

function selectDJ(e) {
  var djName = Session.get("selected_dj");
  Session.set("graph_filter_query", djName || "");
};

Template.djs.djs = function () {

  // accumulate dj's from transitions
  var djs = {}, transitions = Transitions.find().fetch();
  Transitions.find().fetch().forEach(function (transition) {
    var dj = djs[transition['dj']];
    // if we've already seen this dj, increment transition count and playcount
    if (dj) {
      ++dj['transitionCount'];
      dj['transitionPlayCount'] += transition['playCount'];
    }
    // otherwise, add this dj
    else {
      djs[transition['dj']] = {
        'dj': transition['dj'],
        'transitionCount': 1,
        'transitionPlayCount': transition['playCount'],
      }
    }
  });
  var ret = [];
  for (dj in djs) {
    ret.push(djs[dj]);
  }
  return ret;
};

Template.dj.selected = function () {
  return Session.equals("selected_dj", this.dj) ? "selected" : "";
};