Template.player.events({

  'click #play': playMix,

  'click #skip': skipMix,

  'click #pause': pauseMix
});

Template.songNav.events({
  'keyup .search-query': function () {
    Session.set("search_query", $(".search-query").val());
  }
});