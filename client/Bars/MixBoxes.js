Template.MixBoxes.created = function() {
  this.createMix = new ReactiveVar(false);

  if (this.data.showCreate) {
    this.autorun(onModalText.bind(this));
  }
};

Template.MixBoxes.events({
  'click .create': function(e, template) {
    Session.set('MixModalOpen', true);
    template.createMix.set(true);
  },
});

function onModalText() {
  var modalText = Session.get('MixModalText'),
      createMix = this.createMix;

  // create new mix on close
  if ((modalText !== '') && createMix.get()) {
    Mixes.insert({name: modalText});
    Session.set('MixModalText', '');
    createMix.set(false);
  }
}
