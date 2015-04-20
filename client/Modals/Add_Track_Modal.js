var track; // share between inner and outer

function isValidSelection() {
  return track.get() && !(track.get().isDirty());
}

function keyHandler(e) {
  if (e.which === 27) { $('.Add_Track_Modal .deny').click(); } // escape
  if (e.which === 13) { $('.Add_Track_Modal .approve').click(); } // enter
}

Template.Add_Track_Modal.created = function() {
  Utils.requireTemplateData.call(this, 'onSubmit');
  Utils.requireTemplateData.call(this, 'onCancel');

  $(window).on('keyup', keyHandler);
};

Template.Add_Track_Modal.rendered = function() {
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
        template.data.onSubmit(track.get());
        return true;
      } else {
        return false;
      }
    }
  }).modal('show');
};

Template.Add_Track_Modal_Inner.created = function() {
  track = this.track = new ReactiveVar(Tracks.create());
  console.log("add track modal created", this.data, this.data.prevTrack && this.data.prevTrack.getLinkFromIds());
};

function selectTrack(selectedTrack) {
  this.track.set(selectedTrack);
}

Template.Add_Track_Modal_Inner.helpers({
  track: function() {
    return Template.instance().track.get();
  },

  addButtonClass: function() {
    return isValidSelection() ? '' : 'basic disabled';
  },

  // center column if only one
  columnClass: function() {
    var data = Template.currentData();
    return data.prevTrack && data.nextTrack ? '' : 'centered';
  },

  onSelectTrack: function() {
    return selectTrack.bind(Template.instance());
  },

  onSubmitSoundcloud: function() {
    return function(response) {
      var track = Tracks.create();
      track.setSoundcloud(response);
      selectTrack.call(this, track);
    }.bind(Template.instance());
  },

  onDrop: function() {
    return function(files) {
      var track = Tracks.create();
      track.setAudioFiles(files);
      selectTrack.call(this, track);
    }.bind(Template.instance());
  }
});
