Template.Play_Button.created = function() {
  Utils.initTemplateModel.call(this, 'wave');
};

function getTrack(template) {
  return template.data.wave.getTrack();
}

function getWave(template) {
  return template.data.wave;
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
