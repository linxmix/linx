Template.UploadWave.created = function() {
  this.file = new ReactiveVar(null);
};

Template.UploadWave.helpers({
  file: function() {
    return Template.instance().file;
  },

  onSubmitSoundcloud: function() {
    var template = Template.instance();
    return function(url) {
      console.log("UploadWave onSubmitSoundcloud", url);
      template.data.wave.load(url);
    };
  },

  onSelectLinx: function() {
    var template = Template.instance();
    return function(song, results) {
      console.log("UploadWave onSelectLinx", song, song.getS3Url());
      template.data.wave.load(song.getS3Url());
    };
  }
});
