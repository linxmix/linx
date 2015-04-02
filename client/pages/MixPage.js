Template.MixPage.created = function() {
  Utils.initTemplateModel.call(this, 'mix');

  // setup active tracks
  this.activeTracks = new ReactiveVar([]);
};

function getMix(template) {
  var model = template.data.mix;
  return model;
}

Template.MixPage.helpers({
  title: function() {
    return getMix(Template.instance()).get('title');
  },

  createdBy: function() {
    var user = Meteor.user();
    return user && user.username;
  },

  trackCountText: function() {
    var trackCount = getMix(Template.instance()).get('trackIds.length');
    if (!trackCount) {
      return "0 Tracks";
    } else if (trackCount === 1) {
      return "1 Track";
    } else {
      return trackCount + " Tracks";
    }
  },

  saveButtonClass: function() {
    var mix = getMix(Template.instance());
    return mix.isDirty() ? '' : 'disabled';
  },

  tracksAccordion: function() {
    var template = Template.instance();
    var mix = getMix(template);
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
    var mix = getMix(Template.instance());
    var trackIds = mix.get('trackIds');
    return trackIds[trackIds.length - 1];
  },

  onNewTrack: function() {
    var template = Template.instance();
    return function(wave) {
      var mix = getMix(template);
      mix.appendTrack(wave.get('trackId'));
    };
  }
});

Template.MixPage.events({
  'click .save-mix': function(e, template) {
    var mix = getMix(template);
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
