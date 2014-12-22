Session.setDefault("sideBarOpen", false);

Template.SideBar.rendered = function() {
  var $sidebar = $('.left.sidebar');
  $sidebar.sidebar({
    dimPage: false,
    transition: 'uncover',
    onChange: function() {
      Session.set('sideBarOpen', $sidebar.sidebar('is hidden'));
    },
  });
  $sidebar.sidebar('attach events', '.sidebar-launch', 'toggle');

  $sidebar.accordion({exclusive: false, collapsible: true});
};
