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
};

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
