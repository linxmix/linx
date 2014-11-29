Template.soundBar.rendered = function() {
  var $sidebar = $('.bottom.sidebar');
  $sidebar.sidebar({dim: false, overlay: true});
  $sidebar.sidebar('attach events', '.bottom.launch', 'toggle');
}