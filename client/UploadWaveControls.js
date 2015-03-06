Template.UploadWaveControls.helpers({
  needsUpload: function() {
    var track = Template.instance().data.wave.getTrack();
    console.log("needsUpload", track, track && track._local);
    return !track || track._local;
  }
});

Template.UploadWaveControls.events({
  'click .empty': function(e, template) {
    template.data.wave.reset();
  },

  'click .upload': function(e, template) {
    console.log('click upload', template);
  },
});
