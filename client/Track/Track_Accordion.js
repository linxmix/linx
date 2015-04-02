Template.Track_Accordion.created = function() {
  Utils.initTemplateModel.call(this, 'track');
  Utils.initTemplateModel.call(this, 'mix');
};

Template.Track_Accordion.helpers({
  activeClass: function() {
    var data = Template.currentData();
    var track = data.track;
    var activeTracks = data.activeTracks.get();
    return _.contains(activeTracks, track.get('_id')) ? 'active' : '';
  }
});

Template.Track_Accordion.events({
  'click .title': function(e, template) {
    var data = template.data;
    var track = data.track;
    var activeTracks = data.activeTracks.get();
    var index = activeTracks.indexOf(track.get('_id'));
    // toggle track as active
    if (index > -1) {
      activeTracks.splice(index, 1);
    } else {
      activeTracks.push(track.get('_id'));
    }
    data.activeTracks.set(activeTracks);
  },

  'click .remove': function(e, template) {
    var mix = template.data.mix;
    mix.removeTrack(template.data._id);
    mix.updateTemplate();
  }
});

/*** Track_Accordion_Controls ***/
Template.Track_Accordion_Controls.created = function() {
  Utils.initTemplateModel.call(this, 'track');
};

function getTrack(template) {
  return template.data.track;
}

function getWave(template) {
  return getTrack(template).get('wave');
}

Template.Track_Accordion_Controls.helpers({
  isPlaying: function() {
    var wave = getWave(Template.instance());
    return wave.get('playing');
  },
});

Template.Track_Accordion_Controls.events({
  'click .playpause': function(e, template) {
    var wave = getWave(template);
    wave.playpause();
  },
});
