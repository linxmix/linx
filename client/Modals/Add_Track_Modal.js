var track; // share between inner and outer

Template.Add_Track_Modal.created = function() {
  Utils.requireTemplateData.call(this, 'onSubmit');
  Utils.requireTemplateData.call(this, 'onCancel');
};

Template.Add_Track_Modal.rendered = function() {
  var template = this;
  template.$('.modal').modal({
    detachable: true,
    closable: false,
    transition: 'scale',
    onDeny: function() {
      // TODO: this will break if data changes
      template.data.onCancel();
    },
    onApprove: function() {
      // TODO: this will break if data changes
      template.data.onSubmit(track.get());
    }
  }).modal('show');
};

Template.Add_Track_Modal_Inner.created = function() {
  track = this.track = new ReactiveVar(Tracks.build());
};

Template.Add_Track_Modal_Inner.helpers({
  track: function() {
    return Template.instance().track.get();
  },

  addButtonClass: function() {
    var track = Template.instance().track.get();
    return track.isDirty() ? 'basic disabled' : '';
  },

  // center column if only one
  columnClass: function() {
    var data = Template.currentData();
    return data.prevTrack && data.nextTrack ? '' : 'centered';
  },

  selectTrack: function() {
    var template = Template.instance();
    return function(selectedTrack) {
      template.track.set(selectedTrack);
    };
  }
});

Template.Add_Track_Modal_Inner.events({
  'click .reset': function(e, template) {
    console.log("reset");
    template.track.set(Tracks.build());
  },

  'keyup': function (e, template) {
    // TODO
    // console.log("keyup", e);
    // if (e.which === 27) { template.$('.deny').click(); } // escape
    // if (e.which === 13) { template.$('.approve').click(); } // enter
  },
});
