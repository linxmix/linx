Session.set("sideBarOpen", false);

Template.SideBar.rendered = function() {

  // sidebar
  var $sidebar = this.$('.left.sidebar');
  $sidebar.sidebar({
    closable: false,
    dimPage: false,
    transition: 'uncover',
    onChange: function() {
      Session.set('sideBarOpen', $sidebar.sidebar('is hidden'));
    },
  });
  $sidebar.sidebar('attach events', '.sidebar-launch', 'toggle');

  // accordion
  $sidebar.accordion({exclusive: false, collapsible: true});

  // dropdown
  var $dropdown = $('.mix-edit.dropdown');
  $dropdown.dropdown({
    transition: 'scale',
    action: 'hide',
    onChange: function(text, value) {
      console.log("action", text, value);
    },
  });
};

Template.SideBar.events({
  'click .delete-mix': function(e, template) {
    console.log("delete", Session.get('selectedMix'));
    if (window.confirm('Are you sure you want to delete "' + Mixes.findOne(Session.get('selectedMix')).name + '"?')) {
      Mixes.remove(Session.get('selectedMix'));
    }
  },

  'click .edit-mix-info': function(e, template) {
    Session.set('editMixInfo', Session.get('selectedMix'));
    Session.set('MixModalOpen', true);
  },

  'click .edit-mix': function(e, template) {
    Router.go('/linx/edit/' + Session.get('selectedMix'));
  },
});

Template.SideBar.helpers({
  myMixes: function() {
    return Mixes.find();
  },

  otherMixes: function() {
    return [
      {name: 'tiny', _id: 'tiny'},
      {name: 'small', _id: 'small'},
      {name: 'medium', _id: 'medium'},
      {name: 'large', _id: 'large'},
      {name: 'huge', _id: 'huge'},
    ];
  }
});
