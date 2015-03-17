Template.UploadWaveControls.helpers({
  isLocal: function() {
    return Template.instance().data.wave.isLocal();
  },

  isAnalyzed: function() {
    return Template.instance().data.wave.isAnalyzed();
  },

  isLoading: function() {
    return Template.instance().data.wave.isLoading();
  },

  loadingClass: function() {
    return Template.instance().data.wave.isLoading() ? 'loading' : '';
  },

  analyzeIconClass: function() {
    return Template.instance().data.wave.isAnalyzed() ? 'check icon' : 'file audio outline icon';
  },

  analyzeButtonText: function() {
    return Template.instance().data.wave.isAnalyzed() ? 'Analyzed' : 'Analyze';
  },
});

Template.UploadWaveControls.events({
  'click .empty': function(e, template) {
    template.data.wave.reset();
  },

  'click .save': function(e, template) {
    var wave = template.data.wave;
    wave.uploadToBackend();
  },

  'click .analyze': function(e, template) {
    var wave = template.data.wave;
    wave.fetchEchonestAnalysis();
  }
});
