//
// do meteor stuff
//

Template.player.events({

  'click #start': function() {
    startMix(Songs.findOne(Session.get("selected_song")));
  },

  'click #transitionNow': function() {
    doNextTransition(true);
  },

  'click #stop': stopMix
});

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
  'click': function() {
    Session.set("selected_song", this._id);
  },
  'dblclick': function() {
    Session.set("selected_song", this._id);

    // if we're currently playing, queue a "soft" transition to this song
    if (Session.get("current_song")) {
      queueTransition({ endSong: this._id });
      
    // if we aren't playing, start the mix with this song
    } else {
      startMix(Songs.findOne(this._id));
    }
  }
});

Template.player.events({
  'keyup .search-query': function () {
    Session.set("search_query", $(".search-query").val());
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