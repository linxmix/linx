Template.transition.events({
  'click': function(e) {
    Session.set("selected_transition", this._id);
  },
  'dblclick': function(e) {
    Session.set("selected_transition", this._id);
    // if transition select modal is active,
    // this serves as a click to the load transition button
    if (Session.get("transition_select_dialog")) {
      uploaderLoadTransition(e);
    }
    // otherwise, queue this transition
    else {
      Mixer.queue(Transitions.findOne(this._id));
    }
  }
});

Template.song.events({
  'click': function(e) {
    Session.set("selected_song", this._id);
  },
  'dblclick': function(e) {
    Session.set("selected_song", this._id);

    // if song select modal is active, this serves as a click to the load song button
    if (Session.get("song_select_dialog")) {
      uploaderLoadSong(e);
    }
    // queue a "soft" transition to this song if we already have a queue
    else if (Mixer.getQueue().length > 0) {
      Mixer.queue(Songs.findOne(this._id));
    }
    // if we have no queue, start the mix with this song
    else {
      Mixer.play(Songs.findOne(this._id));
    }
  }
});

Template.transitions.transitions = function () {
  var query = Session.get("transition_search_query");
  // if no query, just return all transitions
  if (!query || query === "") {
    return Transitions.find();
  }
  // else, query matches symbols in starting song
  var startSongIds = Songs.find(
    { name: { $regex: Session.get("transition_search_query") } },
    { sort: { name: 1 } }
  ).map(function (song) {
    return song._id;
  });
  return Transitions.find(
    { startSong: { $in: startSongIds } },
    { sort: { name: 1 } }
  // get names for human-readable start and end songs
  ).map(function (transition) {
    transition.startSongName = Songs.findOne(transition.startSong).name;
    transition.endSongName = Songs.findOne(transition.endSong).name;
    return transition;
  });
};

Template.songs.songs = function () {
  return Songs.find(
    { name: { $regex: Session.get("song_search_query") } },
    { sort: { name: 1 } }
  );
};

Template.transition.selected = function () {
  return Session.equals("selected_transition", this._id) ? "selected" : "";
};

Template.transition.current = function () {
  return Session.equals("current_transition", this._id) ? "current" : "";
};

Template.song.selected = function () {
  return Session.equals("selected_song", this._id) ? "selected" : "";
};

Template.song.current = function () {
  return Session.equals("current_song", this._id) ? "current" : "";
};