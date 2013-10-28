Template.transition.events({
  'click': function(e) {
    Session.set("selected_transition", this._id);
  },
  'dblclick': function(e) {
    Session.set("selected_transition", this._id);
    // if transition select modal is active,
    // this serves as a click to the load transition button
    if (Session.equals("open_modal", "transition_select")) {
      Uploader.loadTransition(e);
    }
    // otherwise, queue this transition
    else {
      Mixer.queue({ 'sample': Transitions.findOne(this._id) });
    }
  }
});

Template.transitions.transitions = function () {
  var transitions, query = Session.get("transition_search_query");

  // if no query, get all transitions
  if (!query || query === "") {
    transitions = Transitions.find();

  // else, query matches symbols in starting song
  } else {
    var startSongIds = Songs.find(
      { 'name': { $regex: Session.get("transition_search_query"), $options: 'i' } }
    ).map(function (song) {
      return song._id;
    });
    transitions = Transitions.find(
      { 'startSong': { $in: startSongIds } }
    );
  }

  // get names for human-readable start and end songs
  return transitions.map(function (transition) {
    transition.startSongName = Songs.findOne(transition.startSong).name;
    transition.endSongName = Songs.findOne(transition.endSong).name;
    return transition;
  });
};

Template.transition.selected = function () {
  return Session.equals("selected_transition", this._id) ? "selected" : "";
};

Template.transition.current = function () {
  return Session.equals("current_transition", this._id) ? "current" : "";
};