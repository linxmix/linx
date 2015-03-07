Template.TrackMixer.helpers({
  title: function() {
    console.log("title", Template.instance().data.wave.getMeta('title'));
    return Template.instance().data.wave.getMeta('title');
  },

  artist: function() {
    console.log("artist", Template.instance().data.wave.getMeta('artist'));
    return Template.instance().data.wave.getMeta('artist');
  }
});

Template.TrackMixer.events({
  'click .play': function(e, template) {
    template.data.wave.play();
  },

  'click .pause': function(e, template) {
    template.data.wave.pause();
  }
});
