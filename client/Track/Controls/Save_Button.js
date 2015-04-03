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
  isLocal: function() {
    var track = getTrack(Template.instance());
    return !track.get('_id');
  },
  
  loadingClass: function() {
    var wave = getWave(Template.instance());
    return wave.get('loading') ? 'loading' : '';
  },
});

Template.Save_Button.events({
  'click .save': function(e, template) {
    var track = getTrack(template);
    track.saveToBackend();
  },
});
