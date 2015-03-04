Template.SearchLinx.rendered = function() {
  // TODO: debug, make reactive
  var songs = Songs.find().fetch();
  songs.forEach(function(song) {
    song.description = song.artist;
  });
  this.$('.search').search({
    source: songs,
    searchFields: [
      'title', 'artist'
    ],
    onSelect: this.data.onSelect,
  });
};
