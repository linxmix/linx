Template.MixPage.created = function() {
  // setup active tracks
  this.activeTracks = new ReactiveVar([]);
  var model = this.model = new ReactiveVar(Mixes.build());

  // update model if changed id
  this.autorun(function() {
    var data = Template.currentData();
    if (data._id && data._id !== model.get().get('_id')) {
      model.set(Mixes.findOne(data._id));
    }
  }.bind(this));
};

function getModel(template) {
  var model = template.model.get();
  return model;
}

Template.MixPage.helpers({
  title: function() {
    return getModel(Template.instance()).get('title');
  },

  trackCountText: function() {
    var trackCount = getModel(Template.instance()).get('trackIds.length');
    if (!trackCount) {
      return "0 Tracks";
    } else if (trackCount === 1) {
      return "1 Track";
    } else {
      return trackCount+ " Tracks";
    }
  },

  createdBy: function() {
    var user = Meteor.user();
    return user && user.username;
  },

  saveButtonClass: function() {
    var mix = getModel(Template.instance());
    return mix.isDirty() ? '' : 'disabled';
  },

  tracksInfo: function() {
    var template = Template.instance();
    var mix = getModel(template);
    var activeTracks = template.activeTracks;
    return mix.tracks.all().map(function(track, i) {
      return {
        position: i + 1,
        track: track,
        mix: mix,
        activeTracks: activeTracks,
      };
    });
  },

  lastTrackId: function() {
    var mix = getModel(Template.instance());
    var trackIds = mix.get('trackIds');
    return trackIds[trackIds.length - 1];
  },

  onNewTrack: function() {
    var template = Template.instance();
    return function(trackId) {
      var mix = getModel(template);
      mix.appendTrack(trackId);
    };
  }
});

Template.MixPage.events({
  'click .save-mix': function(e, template) {
    var mix = getModel(template);
    var doRedirect = !mix.get('_id');
    console.log('save mix', mix.get('_id'));
    mix.save();
    // redirect to MixPage if this is a new mix
    if (doRedirect) {
      Router.go('mix', {
        _id: mix.get('_id')
      });
    }
  }
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
