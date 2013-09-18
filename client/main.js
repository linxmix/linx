// init
Session.set("offset", 0);
Session.set("queued_transitions", []);

//
// do meteor stuff
//
Template.player.events({

  'click #start': function() {
    startMix(Songs.findOne(Session.get("selected_song")));
  },

  'click #transitionNow': function() {
    scheduleTransition(true);
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
    startMix(Songs.findOne(this._id));
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

Template.transitions.transitions = function () {
  var currSong = Songs.findOne(Session.get("current_song"));
  if (currSong) {
    return Transitions.find({
        startSong: currSong.name,
        startTime: { $gt: Session.get("offset") + BUFFER_LOAD_TIME }
      }, {
        sort: { name: 1 }
      });
  }
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