Template.SearchLinx.rendered = function() {

  Tracker.autorun(function() {
    var searchParams = this.data.searchParams || {};
    var source, searchFields;

    // Songs
    if (!this.data.isTransition) {
      searchFields = ['title', 'artist'];
      source = Songs.find().fetch(searchParams);
      source.forEach(function(song) {
        song.description = song.artist;
      });

    // Transitions
    } else {
      searchFields = ['inSongTitle', 'outSongTitle'];
      source = Transitions.find().fetch(searchParams);
      source.forEach(function(transition) {
        var inSong = transition.getInSong();
        transition.title = transition.inSongTitle = inSong && inSong.title;
        var outSong = transition.getOutSong();
        transition.description = transition.outSongTitle = outSong && outSong.title;
      });
    }

    // setup semantic search module
    this.$('.search').search({
      source: source,
      searchFields: searchFields,
      onSelect: this.data.onSelect,
    });
  }.bind(this));
};

Template.SearchLinx.helpers({
  loadingClass: function() {
    var wave = Template.instance().data.wave;
    var waveIsLoading = wave.isLoading && wave.isLoading.get();
    return waveIsLoading ? 'loading' : '';
  }
});
