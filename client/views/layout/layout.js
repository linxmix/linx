Template.player.events({

  'click #play': function(e) {
    Mixer.play();
  },

  'click #skip': function(e) {
    Mixer.skip();
  },

  'click #pause': function(e) {
    Mixer.pause();
  },

  'click #pickTransition': function(e) {
    Mixer.pickTransition();
  },

  'click #stop': function(e) {
    Mixer.stop();
  }

});

Template.songNav.events({
  'keyup .song-search-query': function (e) {
    // use modal query if there is one
    var query = Session.get("song_select_dialog") ?
      $(".modal .song-search-query").val() : $(".song-search-query").val();
    Session.set("song_search_query", query);
  }
});

Template.transitionNav.events({
  'keyup .transition-search-query': function (e) {
    // use modal query if there is one
    var query = Session.get("transition_select_dialog") ?
      $(".modal .transition-search-query").val() : $(".transition-search-query").val();
    Session.set("transition_search_query", query);
  }
});