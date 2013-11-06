Template.song.events({
  'click': function(e) {
    Session.set("selected_song", this._id);
  },
  'dblclick': function(e) {
    Session.set("selected_song", this._id);

    // if either song choice modal is active,
    if (Session.equals("open_modal", "song_select") ||
      Session.equals("open_modal", "song_match")) {
      // if on uploaderPage, end this with click to loadSong
      if (Meteor.router.nav() === 'uploaderPage') {
        return Uploader.loadSong(e);
      // otherwise, just close the modal
      } else {
        Modal.close(e);
      }
    }

    // queue a "soft" transition to this song if we already have a queue
    if (Mixer.getQueue().length > 0) {
      Mixer.queue({ 'sample': Songs.findOne(this._id) });
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