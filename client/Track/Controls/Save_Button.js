Template.Save_Button.created = function() {
  Utils.initTemplateModel.call(this, 'track');
};

function getTrack(template) {
  return template.data.track;
}

function getWave(template) {
  return getTrack(template).getWave();
}

Template.Save_Button.helpers({
  isDirty: function() {
    var track = getTrack(Template.instance());
    return track.isDirty();
  },
  
  isLoading: function() {
    var wave = getWave(Template.instance());
    return wave.get('loading');
  },
});

Template.Save_Button.events({
  'click .save': function(e, template) {
    var track = getTrack(template);
    track.saveToBackend();
  },
});
