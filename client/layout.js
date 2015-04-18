Template.layout.created = function() {
  $(window).on('keydown', function(e) {

    // space bar
    if (e.which === 32) {
      e.preventDefault();
      e.stopPropagation();

      // toggle play state of playing wave
      var playingWave = Waves.findOne(Session.get('playingWave'));
      playingWave && playingWave.playpause();

      return false;
    }
  });
};

Template.layout.helpers({
  sideBarOpen: function() {
    return Session.get('sideBarOpen');
  },
});
