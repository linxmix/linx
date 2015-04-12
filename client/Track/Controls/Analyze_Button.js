Template.Analyze_Button.created = function() {
  Utils.initTemplateModel.call(this, 'wave');
};

function getTrack(template) {
  return getWave(template).getTrack();
}

function getWave(template) {
  return template.data.wave;
}

Template.Analyze_Button.helpers({
  isAnalyzed: function() {
    var track = getTrack(Template.instance());
    return track && track.getEchonestAnalysis();
  },

  loadingClass: function() {
    var wave = getWave(Template.instance());
    return wave.get('loading') ? 'loading' : '';
  },
});

Template.Analyze_Button.events({
  'click .analyze': function(e, template) {
    var track = getTrack(template);
    track && track.fetchEchonestAnalysis();
  },
});
