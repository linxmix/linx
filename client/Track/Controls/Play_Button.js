Template.Play_Button.created = function() {
  Utils.initTemplateModel.call(this, 'track');
};

function getTrack(template) {
  return template.data.track;
}

function getWave(template) {
  return getTrack(template).get('wave');
}

Template.Play_Button.helpers({
  isPlaying: function() {
    var wave = getWave(Template.instance());
    return wave.get('playing');
  },
});

Template.Play_Button.events({
  'click .playpause': function(e, template) {
    var wave = getWave(template);
    wave.playpause();
  },
});
