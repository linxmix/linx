Template.transition.events({
  'click': function() {
    Session.set("selected_transition", this._id);
  },
  'dblclick': function() {
    Session.set("selected_transition", this._id);
    queueTransition(Transitions.findOne(this._id), 0);
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
    // if we're currently playing, queue a "soft" transition to this song
    else if (Session.get("current_song")) {
      queueTransition({ endSong: this._id });
    }  
    // if we aren't playing, start the mix with this song
    else {
      startMix(Songs.findOne(this._id));
    }
  }
});

Template.songs.songs = function () {
  return Songs.find(
    { name: { $regex: Session.get("search_query") } },
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