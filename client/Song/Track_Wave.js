Template.Track_Wave.created = function() {
  this.file = new ReactiveVar;
  console.log(this);
}

Template.Track_Wave.helpers({
  loaded: function() {
    return Template.instance().file.get();
  },

  file: function() {
    return Template.instance().file;
  }
})