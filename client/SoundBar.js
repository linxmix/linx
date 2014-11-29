Template.SoundBar.rendered = function() {
  var $sidebar = $('.bottom.sidebar');
  $sidebar.sidebar({dimmed: false, animation: 'overlay'});
  $sidebar.sidebar('attach events', '.bottom.launch', 'toggle');
}