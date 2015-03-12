Template.SearchLinx.rendered = function() {
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

Template.SearchLinx.helpers({
  loadingClass: function() {
    var wave = Template.instance().data.wave;
    var waveIsLoading = wave.isLoading && wave.isLoading.get();
    return waveIsLoading ? 'loading' : '';
  }
});
