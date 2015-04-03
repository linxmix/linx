Template.Drop.created = function() {
  Utils.initTemplateModel.call(this, 'track');
  this.dragover = new ReactiveVar(false);
};

Template.Drop.helpers({
  dropClass: function() {
    return Template.instance().dragover.get() ? 'orange' : 'purple';
  }
});

Template.Drop.events({
  dragenter: function(e, template) {
    template.dragover.set(true);
  },

  dragover: function(e, template) {
    e.preventDefault();
  },

  dragleave: function(e, template) {
    e.preventDefault();
    template.dragover.set(false);
  },

  drop: function(e, template) {
    e.preventDefault();
    template.dragover.set(false);

    // load files
    if (e.originalEvent.dataTransfer.files.length) {

      var track = Template.currentData().track;
      track.loadFiles(e.originalEvent.dataTransfer.files);
    }
  }
});
