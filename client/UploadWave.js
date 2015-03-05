Template.UploadWave.created = function() {
  this.file = new ReactiveVar(null);
};

Template.UploadWave.helpers({
  file: function() {
    return Template.instance().file;
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
