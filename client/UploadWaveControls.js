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
    uploadTrack.call(template.data.wave);
  },
});

function uploadTrack(wave) {
  var track = wave.getTrack();
}
