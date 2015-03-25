Template.WaveControls.helpers({
  title: function() {
    return Template.instance().data.wave.getMeta('title');
  },

  artist: function() {
    return Template.instance().data.wave.getMeta('artist');
  },

  isLocal: function() {
    return Template.instance().data.wave.isLocal();
  },

  isAnalyzed: function() {
    return Template.instance().data.wave.isAnalyzed();
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

Template.WaveControls.events({
  'click .play': function(e, template) {
    template.data.wave.play();
  },

  'click .pause': function(e, template) {
    template.data.wave.pause();
  },
  
  'click .empty': function(e, template) {
    template.data.wave.reset();
  },

  'click .save': function(e, template) {
    template.data.wave.uploadToBackend();
  },

  'click .analyze': function(e, template) {
    template.data.wave.fetchEchonestAnalysis();
  }
});
