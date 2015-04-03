Template.Drop.created = function() {
  Utils.requireTemplateData.call(this, 'onDrop');
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

    // call handler
    if (e.originalEvent.dataTransfer.files.length) {
      Template.currentData().onDrop(e.originalEvent.dataTransfer.files);
    }
  }
});
