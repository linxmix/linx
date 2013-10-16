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

Template.songs.songs = function () {
  return Songs.find(
    { 'name': { $regex: Session.get("song_search_query"), $options: 'i' } },
    { 'sort': { 'name': 1 } }
  );
};

Template.song.selected = function () {
  return Session.equals("selected_song", this._id) ? "selected" : "";
};

Template.song.current = function () {
  return Session.equals("current_song", this._id) ? "current" : "";
};