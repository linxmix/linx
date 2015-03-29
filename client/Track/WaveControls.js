Template.WaveControls.helpers({
  isPlaying: function() {
    var wave = getWave(Template.instance());
    return wave.get('playing');
  },

  isLocal: function() {
    var wave = getWave(Template.instance());
    return wave.hasNewTrack();
  },

  isAnalyzed: function() {
    var wave = getWave(Template.instance());
    return wave.get('analyzed');
  },

  loadingClass: function() {
    var wave = getWave(Template.instance());
    return wave.get('loading') ? 'loading' : '';
  },

  analyzeIconClass: function() {
    var wave = getWave(Template.instance());
    return wave.get('analyzed') ? 'check icon' : 'file audio outline icon';
  },

  analyzeButtonText: function() {
    var wave = getWave(Template.instance());
    return wave.get('analyzed') ? 'Analyzed' : 'Analyze';
  },
});

Template.WaveControls.events({
  'click .playpause': function(e, template) {
    var wave = getWave(template);
    wave.playpause();
  },
  
  'click .empty': function(e, template) {
    var wave = getWave(template);
    wave.reset();
  },

  'click .save': function(e, template) {
    // TODO
    // wavesurfer.uploadToBackend();
  },

  'click .analyze': function(e, template) {
    // TODO
    // wavesurfer.fetchEchonestAnalysis();
  }
});

function getWave(template) {
  return Waves.findOne(template.data._idWave);
}
