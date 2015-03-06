Session.set('MixModalText', '');
Session.set('MixModalOpen', false);

Template.MixModal.created = function() {
  this.autorun(onToggleModal.bind(this));
  this.autorun(onModalSubmit.bind(this));
};

Template.MixModal.rendered = function() {
  var $modal = this.$('.mix-modal');
  $modal.modal({
    detachable: false,
    closable: false,
    onHide: function() {
      Session.set('MixModalOpen', false);
    }
  });
};

Template.MixModal.helpers({
  mix: function() {
    return Mixes.findOne(Session.get('editMixInfo')) || {};
  }
});

Template.MixModal.events({
  'click .cancel': function(e, template) {
    clearModal(e, template);
  },

  'click .save': function(e, template) {
    submitModal(e, template);
  },

  'keyup .mixname': function (e, template) {
    if (e.which === 13) {
      template.$('.save').click();
    }
  },
});

function submitModal(e, template) {
  Session.set('MixModalText', template.$('.mixname').val());
  clearModal(e, template);
}

function clearModal(e, template) {
  template.$('.mixname').val('');
}

function onToggleModal() {
  var $modal = $('.mix-modal');

  if (Session.get('MixModalOpen')) {
    $modal.modal('show');
  } else {
    $modal.modal('hide');
  }
}

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
