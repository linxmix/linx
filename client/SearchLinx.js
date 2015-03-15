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
      searchFields = ['title'];
      source = Transitions.find().fetch(searchParams);
      source.forEach(function(transition) {
        // TODO: move into transition.getTitle()?
        var inSong = transition.getInSong();
        var inSongTitle = inSong && inSong.title;
        var outSong = transition.getOutSong();
        var outSongTitle = outSong && outSong.title;
        transition.title = inSongTitle + ' TO ' + outSongTitle;
        if (transition.hasIssue) {
          transition.description = transition.hasIssue;
        }
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
    var waveIsLoading = wave.isLoading && wave.isLoading();
    return waveIsLoading ? 'loading' : '';
  }
});
