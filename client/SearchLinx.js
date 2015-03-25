Template.SearchLinx.rendered = function() {

  Tracker.autorun(function() {
    var source, searchFields;

    searchFields = ['title', 'artist'];
    source = Tracks.all();
    source.forEach(function(track) {
      track.title = track.get('title');
      track.description = track.get('artist');
    });

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
