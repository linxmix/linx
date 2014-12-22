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

// MixBox

Template.MixBox.rendered = function() {
  this.$('.edit').hide();
  this.$('.edit-buttons').hide();

  // this.$('.dropdown').dropdown({
  //   transition: 'drop',
  //   action: function(text, value) {
  //     console.log("action", text, value);
  //   },
  // });
};

Template.MixBox.events({
  'click .edit': function(e, template) {
    template.$('.edit-buttons').toggle();
  },

  'mouseenter .field': function(e, template) {
    template.$('.edit').show();
  },

  'mouseleave .field': function(e, template) {
    template.$('.edit').hide();
  },

  'click .remove-mix': function(e, template) {
    Mixes.remove(this._id);
  },

  'click .edit-mix': function(e, template) {
    console.log("edit mix");
  },

  'click .edit-name': function(e, template) {
    console.log("edit name");
  },
});
