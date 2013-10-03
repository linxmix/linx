Template.player.events({

  'click #play': Mixer.play,

  'click #skip': Mixer.skip,

  'click #pause': Mixer.pause
});

Template.songNav.events({
  'keyup .search-query': function () {
    // use modal query if there is one
    var query = Session.get("song_select_dialog") ?
      $(".modal .search-query").val() : $(".search-query").val();
    Session.set("search_query", query);
    console.log(query);
  }
});