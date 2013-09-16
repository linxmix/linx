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

  'click #stop': stopMix,

  'click #queueTransition': function() {
    queueTransition(Transitions.findOne(Session.get("selected_transition")), 0);
  }
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

Template.songs.songs = function () {
  return Songs.find({}, { sort: { name: 1 }});
};

Template.transitions.transitions = function () {
  var currSong = Songs.findOne(Session.get("current_song"));
  if (currSong) {
    return Transitions.find({
        startSong: currSong.name,
        startTime: { $gt: Session.get("offset") + 5 }
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