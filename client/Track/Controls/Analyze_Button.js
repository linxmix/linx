Template.Analyze_Button.created = function() {
  Utils.initTemplateModel.call(this, 'track');
};

function getTrack(template) {
  return template.data.track;
}

function getWave(template) {
  return getTrack(template).get('wave');
}

Template.Analyze_Button.helpers({
  isAnalyzed: function() {
    var wave = getWave(Template.instance());
    return wave.get('analyzed');
  },

  loadingClass: function() {
    var wave = getWave(Template.instance());
    return wave.get('loading') ? 'loading' : '';
  },
});

Template.Analyze_Button.events({
  'click .analyze': function(e, template) {
    var wave = getWave(template);
    // TODO
  },
});
