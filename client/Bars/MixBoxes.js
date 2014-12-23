Template.MixBoxes.events({
  'click .create': function(e, template) {
    Session.set('editMixInfo', undefined);
    Session.set('MixModalOpen', true);
  },
});
