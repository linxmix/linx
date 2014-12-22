Session.setDefault("sideBarOpen", false);
Session.set("sideBarOpen", false);

Template.SideBar.rendered = function() {
  var $sidebar = $('.left.sidebar');
  $sidebar.sidebar({
    closable: false,
    dimPage: false,
    transition: 'uncover',
    onChange: function() {
      Session.set('sideBarOpen', $sidebar.sidebar('is hidden'));
    },
  });
  $sidebar.sidebar('attach events', '.sidebar-launch', 'toggle');

  $sidebar.accordion({exclusive: false, collapsible: true});

  $('.ui.checkbox').checkbox();
};

Template.SideBar.events({
});

Template.SideBar.helpers({
  myMixes: function() {
    return Mixes.find();
  },

  otherMixes: function() {
    return [
      {name: 'tiny'},
      {name: 'small'},
      {name: 'medium'},
      {name: 'large'},
      {name: 'huge'},
    ];
  }
});
