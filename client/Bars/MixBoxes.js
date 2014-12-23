Template.MixBoxes.created = function() {
  if (this.data.showCreate) {
    this.autorun(onModalSubmit.bind(this));
  }
};

Template.MixBoxes.events({
  'click .create': function(e, template) {
    Session.set('editMixInfo', undefined);
    Session.set('MixModalOpen', true);
  },
});

function onModalSubmit() {
  var modalText = Session.get('MixModalText'),
      mix = Mixes.findOne(Session.get('editMixInfo'));

  if (modalText === '' || Session.get('MixModalOpen')) { return; }

  // create or edit mix
  var attrs = {name: modalText};
  if (!mix) {
    Mixes.insert(attrs);
  } else {
    mix.update(attrs);
  }

  Session.set('MixModalText', '');
  Session.set('editMixInfo', undefined);
}
