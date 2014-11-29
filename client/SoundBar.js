Session.setDefault("playing", null);

Template.SoundBar.rendered = function() {
  var $sidebar = $('.bottom.sidebar');
  $sidebar.sidebar({dimPage: false, animation: 'overlay'});
  $sidebar.sidebar('attach events', '.bottom.launch', 'toggle');
}