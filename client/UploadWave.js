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
      // TODO: make call to api.soundcloud.com/resolve stuff
      template.data.wave.load(url);
    };
  },

  onSelectLinx: function() {
    return function() {
      console.log("UploadWave onSelectLinx");
    };
  }
});
