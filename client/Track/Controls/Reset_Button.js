Template.Reset_Button.created = function() {
  Utils.initTemplateModel.call(this, 'track');
};

function getTrack(template) {
  return template.data.track;
}

function getWave(template) {
  return getTrack(template).get('wave');
}

Template.Reset_Button.helpers({
  isAnalyzed: function() {
    var wave = getWave(Template.instance());
    return wave.get('analyzed');
  }
});

Template.Reset_Button.events({
  'click .reset': function(e, template) {
    var wave = getWave(template);
    wave.reset();
  },
});
