Template.player.events({

  'click #start': function() {
    startMix(Songs.findOne(Session.get("selected_song")));
  },

  'click #transitionNow': function() {
    transitionNow();
  },

  'click #pause': pauseMix
});

Template.songNav.events({
  'keyup .search-query': function () {
    Session.set("search_query", $(".search-query").val());
  }
});