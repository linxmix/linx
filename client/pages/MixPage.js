Template.MixPage.created = function() {
  Utils.initTemplateModel.call(this, 'mix');

  this.addModalTrackIndex = new ReactiveVar(-1);
  this.activeLinkPos = new ReactiveVar(-1);
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
    var addModalTrackIndex = template.addModalTrackIndex;
    var activeLinkPos = template.activeLinkPos;
    var mix = getMix(template);

    function onViewLink(position) {
      if (activeLinkPos.get() === position) {
        activeLinkPos.set(-1);
      } else {
        activeLinkPos.set(position);
      }
    }

    return mix.get('trackIds').map(function(trackId, i) {
      var track = Tracks.findOne(trackId);
      var pos = i + 1;
      return {
        position: pos,
        addModalTrackIndex: addModalTrackIndex,
        track: track,
        mix: mix,
        activeLinkPos: activeLinkPos,
        onViewLink: onViewLink,
      };
    });
  },

  prevTrack: function() {
    var template = Template.instance();
    var index = template.addModalTrackIndex.get();
    var mix = getMix(template);
    return mix.getTrackAt(index - 1);
  },

  nextTrack: function() {
    var template = Template.instance();
    var index = template.addModalTrackIndex.get();
    var mix = getMix(template);
    return mix.getTrackAt(index);
  },

  addTrack: function() {
    var template = Template.instance();
    return function(track) {
      var index = template.addModalTrackIndex.get();
      var mix = template.data.mix;
      mix.addTrackAt(track.get('_id'), index);
      template.addModalTrackIndex.set(-1);
    }.bind(this);
  },

  resetAddModal: function() {
    var template = Template.instance();
    return function() {
      template.addModalTrackIndex.set(-1);
    };
  },

  isAddModalOpen: function() {
    var template = Template.instance();
    var index = template.addModalTrackIndex.get();
    return index > -1;
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
