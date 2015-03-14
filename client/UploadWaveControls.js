Template.UploadWaveControls.helpers({
  isLocal: function() {
    return Template.instance().data.wave.isLocal();
  },

  isAnalyzed: function() {
    return Template.instance().data.wave.isAnalyzed();
  },

  loadingClass: function() {
    return Template.instance().data.wave.isLoading.get() ? 'loading' : '';
  }
});

Template.UploadWaveControls.events({
  'click .empty': function(e, template) {
    template.data.wave.reset();
  },

  'click .save': function(e, template) {
    var wave = template.data.wave;
    console.log("save");
    // upload track to backend, then analyze
    wave.uploadToBackend(function() {
      if (!wave.isAnalyzed()) {
        wave.fetchEchonestAnalysis();
      }
    });
  },

  'click .analyze': function(e, template) {
    var wave = template.data.wave;
    if (wave.isLocal()) {
      // if wave is local, upload to backend, then analyze
      wave.uploadToBackend(function() {
        wave.fetchEchonestAnalysis();
      });
    } else {
      wave.fetchEchonestAnalysis();
    }
  }
});
