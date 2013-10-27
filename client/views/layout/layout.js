Template.player.rendered = function () {
  // set up volume slider
  var volumeSlider = $(this.find('.volumeSlider'));
  volumeSlider.slider({
    'min': 0,
    'max': 1,
    'step': 0.01,
    'value': 1.0,
    'tooltip': 'hide',
  })
  .on('slide', function(ev) {
    Session.set("mixer_volume", ev.value);
  });
};

Template.player.events({

  'click #playPause': function(e) {
    Mixer.playPause();
  },

  'click #skip': function(e) {
    Mixer.skip();
  },

  'click #pickTransition': function(e) {
    Mixer.pickTransition();
  },

  'click #stop': function(e) {
    Mixer.stop();
  },

  'click #clearQueue': function(e) {
    Mixer.clearQueue();
  },

});

Template.songNav.events({
  'keyup .song-search-query': function (e) {
    // use modal query if there is one
    var query = !!Session.get("open_modal") ?
      $(".modal .song-search-query").val() : $(".layout-nav .song-search-query").val();
    Session.set("song_search_query", query);
  }
});

Template.transitionNav.events({
  'keyup .transition-search-query': function (e) {
    // use modal query if there is one
    var query = !!Session.get("open_modal") ?
      $(".modal .transition-search-query").val() : $(".layout-nav .transition-search-query").val();
    Session.set("transition_search_query", query);
  }
});