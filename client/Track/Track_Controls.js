Template.Track_Controls.created = function() {
  Utils.initTemplateModel.call(this, 'track');
};

function getTrack(template) {
  return template.data.track;
}

function getWave(template) {
  return getTrack(template).get('wave');
}

// TODO: move some/all/none of these functions to track?
Template.Track_Controls.helpers({
  isPlaying: function() {
    var wave = getWave(Template.instance());
    return wave.get('playing');
  },

  isLocal: function() {
    var track = getTrack(Template.instance());
    return !track.get('_id');
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

Template.Track_Controls.events({
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
