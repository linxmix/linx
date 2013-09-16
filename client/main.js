// init
Session.set("offset", 0);

//
// do meteor stuff
//
Template.player.events({

  'click #start': function() {
    startMix(Songs.findOne(Session.get("selected_song")));
  },

  'click #transitionNow': function() {
    scheduleTransition(Transitions.findOne(Session.get("current_transition")), true);
  },

  'click #stop': stopMix,

  // TODO: make it so you can only do this (and transition now) during a song, not during a transition!
  // ^ implemented by checking currSong to see if it's a transition
  'click #selectTransition': function() {
    Transitions.findOne(Session.get("selected_transition"));
  }
});

Template.transition.events({
  'click': function() {
    Session.set("selected_transition", this._id);
  },
  'dblclick': function() {
    Session.set("selected_transition", this._id);
    selectTransition(Transitions.findOne(this._id));
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

// TODO: sliders for volume and offset. maybe a skip 30sec button?

Template.songs.songs = function () {
  return Songs.find({}, { sort: { name: 1 }});
};

Template.transitions.transitions = function () {
  var currSong = Songs.findOne(Session.get("current_song"));
  if (currSong) {
    return Transitions.find({
        startSong: currSong.name,
        // TODO: formalize this concept of "5" - it's the buffer load time ("lag")
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