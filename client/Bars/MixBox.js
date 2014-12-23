Template.MixBox.created = function() {
  this.hovered = new ReactiveVar();
};

Template.MixBox.rendered = function() {
  this.$('.edit-buttons').hide();
};

Template.MixBox.helpers({
  hidden: function() {
    return Template.instance().hovered.get() !== this._id ?
      'hidden' : '';
  },
});

Template.MixBox.events({
  'click .edit': function(e, template) {
    // template.$('.edit-buttons').toggle();
    $('.mix-edit.dropdown').css({
      'left': event.pageX,
      'top': event.pageY,
    });
    $('.mix-edit.dropdown').dropdown('show');
    Session.set('selectedMix', this._id);
  },

  'mouseenter .field': function(e, template) {
    template.hovered.set(this._id);
  },

  'mouseleave .field': function(e, template) {
    template.hovered.set();
  },
});
