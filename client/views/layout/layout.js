Template.player.events({

  'click #play': Mixer.play,

  'click #skip': Mixer.skip,

  'click #pause': Mixer.pause
});

Template.songNav.events({
  'keyup .song-search-query': function () {
    // use modal query if there is one
    var query = Session.get("song_select_dialog") ?
      $(".modal .song-search-query").val() : $(".song-search-query").val();
    Session.set("song_search_query", query);
  }
});

Template.transitionNav.events({
  'keyup .transition-search-query': function () {
    // use modal query if there is one
    var query = Session.get("transition_select_dialog") ?
      $(".modal .transition-search-query").val() : $(".transition-search-query").val();
    Session.set("transition_search_query", query);
  }
});