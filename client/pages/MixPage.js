Template.MixPage.created = function() {
  console.log("id", this.data._id);
  // setup active tracks
  this.activeTracks = new ReactiveVar([]);
};

function getModel(template) {
  var model = Utils.db(Mixes, 'findOne', template.data._id);
  return model;
}

Template.MixPage.helpers({
  saveButtonClass: function() {
    var mix = getModel(Template.instance());
    return mix.isDirty() ? '' : 'disabled';
  },

  tracksInfo: function() {
    console.log("tracksInfo");
    var template = Template.instance();
    var mix = getModel(template);
    var activeTracks = template.data.activeTracks;
    return mix.tracks.all().map(function(track) {
      return {
        track: track,
        mix: mix,
        activeTracks: activeTracks,
      };
    });
  },

  onNewTrack: function() {
    var template = Template.instance();
    return function(trackId) {
      var mix = getModel(template);
      mix.appendTrack(trackId);
      mix.updateTemplate();
    };
  }
});

Template.MixPage.events({
});


Template.TrackAccordion.helpers({
  activeClass: function() {
    var data = Template.instance().data;
    var track = data.track;
    var activeTracks = data.activeTracks.get();
    return _.contains(activeTracks, track.get('_id')) ? 'active' : '';
  }
});

Template.TrackAccordion.events({
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
