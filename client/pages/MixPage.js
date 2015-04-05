Template.MixPage.created = function() {
  Utils.initTemplateModel.call(this, 'mix');
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
    return mix.get('trackIds').map(function(trackId, i) {
      var track = Tracks.findOne(trackId);
      var pos = i + 1;
      return {
        position: pos,
        track: track,
        mix: mix,
      };
    });
  },

  prevTrack: function() {
    var mix = getMix(Template.instance());
    var tracks = mix.tracks.all();
    return tracks[tracks.length - 1];
  },

  nextTrack: function() {
    var mix = getMix(Template.instance());
    var tracks = mix.tracks.all();
    return tracks[tracks.length - 1];
  },

  addTrack: function() {
    var mix = getMix(Template.instance());
    return function(track) {
      mix.appendTrack(track.get('_id'));
    }.bind(this);
  },
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

Template.Track_Adder.created = function() {
  this.track = new ReactiveVar(Tracks.build());
};

Template.Track_Adder.helpers({
  track: function() {
    return Template.instance().track.get();
  },
});

function resetTrack(template) {
  template.track.set(Tracks.build());
}

Template.Track_Adder.events({
  'click .add': function(e, template){
    template.data.addTrack(template.track.get());
    resetTrack(template);
  },

  'click .reset': function(e, template) {
    resetTrack(template);
  }
});
