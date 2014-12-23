Template.MixDropdown.rendered = function() {
  var $dropdown = this.$('.dropdown');
  $dropdown.dropdown({
    transition: 'scale',
    action: 'hide',
    onChange: function(text, value) {
      console.log("action", text, value);
    },
  });
};

Template.MixDropdown.events({
  'click .delete-mix': function(e, template) {
    if (window.confirm('Are you sure you want to delete "' + Mixes.findOne(Session.get('selectedMix')).name + '"?')) {
      Mixes.remove(Session.get('selectedMix'));
    }
  },

  'click .edit-mix-info': function(e, template) {
    Session.set('editMixInfo', Session.get('selectedMix'));
    Session.set('MixModalOpen', true);
  },

  'click .edit-mix': function(e, template) {
    Router.go('/linx/mix/' + Session.get('selectedMix'));
  },
});
