Template.Drop.created = function() {
  this.data.dragover = new ReactiveVar(false);
};

Template.Drop.helpers({
  dropClass: function() {
    return Template.instance().data.dragover.get() ? 'orange' : 'purple';
  }
});

Template.Drop.events({
  dragenter: function(e, template) {
    template.data.dragover.set(true);
  },

  dragover: function(e, template) {
    e.preventDefault();
  },

  dragleave: function(e, template) {
    e.preventDefault();
    template.data.dragover.set(false);
  },

  drop: function(e, template) {
    e.preventDefault();
    template.data.dragover.set(false);

    // load files
    if (e.originalEvent.dataTransfer.files.length) {
      var wave = Waves.findOne(template.data._idWave);
      wave.loadFiles(e.originalEvent.dataTransfer.files);
    }
  }
});
