Session.set('MixModalOpen', false);
Session.set('MixModalText', '');

Template.MixModal.created = function() {
  this.autorun(onToggleModal);
};

Template.MixModal.rendered = function() {
  var $modal = $('.mix-modal');
  $modal.modal({
    detachable: false,
    closable: false,
    onHide: function() {
      Session.set('MixModalOpen', false);
    },
  });
};

Template.MixModal.events({
  'click .cancel': function(e, template) {
    clearModal();
  },

  'click .ok': function(e, template) {
    Session.set('MixModalText', template.$('.mixname').val());
    clearModal();
  }
});

function clearModal() {
  $('.mix-modal .mixname').val('');
}

function onToggleModal() {
  var $modal = $('.mix-modal');

  if (!!Session.get('MixModalOpen')) {
    $modal.modal('show');
  } else {
    $modal.modal('hide');
  }
}
