Template.UploadWave.created = function() {
  this.data.file = new ReactiveVar(null);
};

Template.UploadWave.helpers({
  file: function() {
    return Template.instance().data.file;
  },

  onSubmitSoundcloud: function() {
    var template = Template.instance();
    // create new song with given soundcloudAttrs
    return function(soundcloudAttrs) {
      var newTrack = Utils.createLocalModel(Songs);
      newTrack.setSoundcloud(soundcloudAttrs);
      template.data.wave.loadTrack(newTrack, 'soundcloud');
    };
  },

  onSelectLinx: function() {
    var template = Template.instance();
    return function(track, results) {
      template.data.wave.loadTrack(track, 's3');
    };
  }
});

Template.UploadWave.events({
  'click .empty': function(e, template) {
    template.data.wave.reset();
  },

  'click .upload': function(e, template) {
    console.log('click upload', template);
  },
});
