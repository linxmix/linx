Template.Save_Button.created = function() {
  Utils.initTemplateModel.call(this, 'wave');
};

function getTrack(template) {
  return getWave(template).getTrack();
}

function getWave(template) {
  return template.data.wave;
}

Template.Save_Button.helpers({
  isDirty: function() {
    var track = getTrack(Template.instance());
    return track && track.isDirty();
  },
  
  isLoading: function() {
    var track = getTrack(Template.instance());
    return track.get('loading');
  },
});

Template.Save_Button.events({
  'click .save': function(e, template) {
    getTrack(template).saveToBackend();
  },
});
