// Augment WaveSurfer Prototype
Meteor.startup(function() {

  //
  // Reactive functions
  //
  WaveSurfer.hasSelectedRegion = Utils.withErrorHandling(function() {
    return !!this.getRegion('selected');
  }, 'hasSelectedRegion');

  WaveSurfer.getRegion = Utils.withErrorHandling(function(regionId) {
    var regions = this.getMeta('regions');
    return regions[regionId];
  }, 'getRegion');

  WaveSurfer.isLocal = Utils.withErrorHandling(function() {
    var isLocal = this.getMeta('isLocal');
    return (typeof isLocal === 'boolean') && isLocal;
  }, 'isLocal');

  WaveSurfer.getAnalysis = Utils.withErrorHandling(function() {
    return this.getMeta('echonestAnalysis');
  }, 'getAnalysis');

  WaveSurfer.isAnalyzed = Utils.withErrorHandling(function() {
    return !!this.getAnalysis();
  }, 'isAnalyzed');

  WaveSurfer.isLoaded = Utils.withErrorHandling(function() {
    return this.loaded && this.loaded.get();
  }, 'isLoaded');

  WaveSurfer.isLoading = Utils.withErrorHandling(function() {
    return this.loading && this.loading.get();
  }, 'isLoading');

  WaveSurfer.getMeta = Utils.withErrorHandling(function(attr) {
    var meta = this.meta && this.meta.get();
    if (meta) {
      return meta[attr];
    }
  }, 'getMeta');

  // Get a carbon copy of the track
  WaveSurfer.getTrack = Utils.withErrorHandling(function() {
    var trackId = this.getMeta('_id');
    var linxType = this.getMeta('linxType');
    if (trackId) {
      var collection = linxType === 'song' ? Songs : Transitions;
      return collection.findOne(trackId);
    }
  }, 'getTrack');
  //
  // /Reactive Functions
  //

});
