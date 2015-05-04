var tracks; // share between inner and outer

function isValidSelection() {
  return tracks.get() && tracks.get().length &&
    !(_.some(tracks.get(), function(track) {
      return track.isDirty();
    }));
}

function createTrack() {
  return Tracks.create({ isNew: true });
}

function addTrack(track) {
  var currTracks = tracks.get();
  currTracks.push(track);
  tracks.set(currTracks);
}

function removeTrack(index) {
  var currTracks = tracks.get();
  currTracks.splice(index, 1);
  tracks.set(currTracks);
}

function getUnsavedTracks() {
  return _.filter(tracks.get(), function(track) {
    return track.isNew();
  });
}

function tracksAreLoading() {
  // return !!_.some(tracks.get(), function(track) {
    // return track.get('isLoading');
  // });
  return false;
}

function keyHandler(e) {
  if (e.which === 27) { $('.Add_Tracks_Modal .deny').click(); } // escape
  // if (e.which === 13) { $('.Add_Tracks_Modal .approve').click(); } // enter
}

Template.Add_Tracks_Modal.created = function() {
  Utils.requireTemplateData.call(this, 'onSubmit');
  Utils.requireTemplateData.call(this, 'onCancel');

  $(window).on('keyup', keyHandler);

  // Setup full page drop zone
  Utils.initFullPageDrop(function(files) {
    _.each(files, function(file) {
      var track = createTrack();
      track.setAudioFile(file);
      addTrack(track);
    });
  });
};

Template.Add_Tracks_Modal.destroyed = function() {
  Utils.destroyFullPageDrop();
};

Template.Add_Tracks_Modal.rendered = function() {
  var template = this;
  template.$('.modal').modal({
    detachable: true,
    closable: false,
    transition: 'scale',
    onDeny: function() {
      $(window).off('keyup', keyHandler);
      template.data.onCancel();
    },
    onApprove: function() {
      if (isValidSelection()) {
        $(window).off('keyup', keyHandler);
        template.data.onSubmit(tracks.get());
        return true;
      } else {
        return false;
      }
    }
  }).modal('show');
};

Template.Add_Tracks_Modal_Inner.created = function() {
  tracks = this.tracks = new ReactiveVar([]);
};

Template.Add_Tracks_Modal_Inner.helpers({
  tracksInfo: function() {
    var currTracks = Template.instance().tracks.get();

    return currTracks && currTracks.map(function(track, i) {
      return {
        track: track,
        onRemoveTrack: function() {
          return removeTrack.bind(this, i);
        }
      };
    });
  },

  approveButtonClass: function() {
    if (tracksAreLoading()) {
      return 'orange loading';
    }

    var unsavedTracks = getUnsavedTracks();
    var text = isValidSelection() ? '' : 'basic disabled';
    if (unsavedTracks.length) {
      text = 'orange save-all';
    } else if (!isValidSelection()) {
      text = 'basic disabled add';
    } else {
      text = 'green approve';
    }
    return text;
  },

  approveIconClass: function() {
    return getUnsavedTracks().length ? 'cloud upload' : 'add';
  },

  approveButtonText: function() {
    var tracks = getUnsavedTracks();
    var text;

    if (tracks.length) {
      text = "Save Track";
    } else {
      tracks = Template.instance().tracks.get();
      text = "Add Track";
    }

    if (tracks.length > 1) { text += "s"; }
    return text + " (" + tracks.length + ")";
  },

  // center column if only one
  columnClass: function() {
    var data = Template.currentData();
    return data.prevTrack && data.nextTrack ? '' : 'centered';
  },

  onSelectTrack: function() {
    return addTrack;
  },

  onSubmitSoundcloud: function() {
    return function(response) {
      var track = createTrack();
      track.setSoundcloud(response);
      addTrack(track);
    };
  },

  // TODO: remove drop template?
  onDrop: function() {
    return function() {};
  },

});

Template.Add_Tracks_Modal_Inner.events({
  'click .save-all': function(e, template) {
    template.$('.save.button').click();
  }
});
