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

    // // don't allow wav files
    // // TODO: this doesn't belong here
    // var fileType = files[0].type;
    // if (fileType && fileType.match('wav')) {
    //   window.alert("Please convert your file from .wav format - .wav is too large.");
    //   return;
    // }

    _.each(files, function(file) {
      var track = createTrack();
      track.setAudioFiles(file);
      addTrack(track);
    });

    console.log("add track modal drop", files);
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

  addButtonClass: function() {
    return isValidSelection() ? '' : 'basic disabled';
  },

  addButtonText: function() {
    var tracksLength = Template.instance().tracks.get().length;
    var text = "Add Track";
    if (tracksLength > 1) { text += "s"; }
    return text + " (" + tracksLength + ")";
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
