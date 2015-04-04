Template.Track_Accordion.created = function() {
  Utils.initTemplateModel.call(this, 'track');
  Utils.initTemplateModel.call(this, 'mix');

  Utils.requireTemplateData.call(this, 'activeTracks');
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

  'click .remove-button': function(e, template) {
    var mix = template.data.mix;
    var track = template.data.track;
    mix.removeTrack(track.get('_id'));
  }
});
