Template.SoundButtons.helpers({
  soundBarPlaying: function() {
    return Session.get('soundBarPlaying');
  },

  soundBarOpen: function() {
    return Session.get('soundBarOpen');
  }
});

Template.SoundButtons.events({
  'click .playpause': function(e) {
    Session.set('soundBarPlaying', !Session.get('soundBarPlaying'));
  },

  'click .back': function(e) {
    console.log('back');
  },

  'click .forth': function(e) {
    console.log('forth');
  }
});
