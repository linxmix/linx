Template.TrackMixer.helpers({
  title: function() {
    return Template.instance().data.wave.getMeta('title');
  },

  artist: function() {
    return Template.instance().data.wave.getMeta('artist');
  }
});

Template.TrackMixer.events({
  'click .play': function(e, template) {
    template.data.wave.play();
  },

  'click .pause': function(e, template) {
    template.data.wave.pause();
  },

  'click .empty': function(e, template) {
    template.data.wave.reset();
  },

  'click .upload': function(e, template) {
    console.log('click upload', template);
  },
});
