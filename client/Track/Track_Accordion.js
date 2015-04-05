Template.Track_Accordion.created = function() {
  Utils.initTemplateModel.call(this, 'track');
  Utils.initTemplateModel.call(this, 'mix');

  Utils.requireTemplateData.call(this, 'activeTracks');
  Utils.requireTemplateData.call(this, 'addPos');
};

Template.Track_Accordion.helpers({
  dropdownIconClass: function() {
    var data = Template.currentData();
    var addPos = data.addPos.get();
    var position = data.position;
    return addPos === position ? 'green' : '';
  },

  addButtonClass: function() {
    var data = Template.currentData();
    var addPos = data.addPos.get();
    var position = data.position;
    return addPos === position ? 'active' : '';
  },

  activeClass: function() {
    var data = Template.currentData();
    var track = data.track;
    var activeTracks = data.activeTracks.get();
    return _.contains(activeTracks, track.get('_id')) ? 'active' : '';
  },
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
    e.preventDefault();
    e.stopPropagation();
    var mix = template.data.mix;
    var track = template.data.track;
    mix.removeTrack(track.get('_id'));
  },

  'click .add-button': function(e, template) {
    e.preventDefault();
    e.stopPropagation();
    template.data.addPos.set(template.data.position);
  },
});
