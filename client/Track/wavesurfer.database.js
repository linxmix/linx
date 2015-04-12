// // Augment WaveSurfer Prototype
// Meteor.startup(function() {
  
//   //
//   // Database Updates
//   //
//   WaveSurfer.setEchonest = Utils.withErrorHandling(function(attrs) {
//     console.log("set echonest", attrs);
//     attrs = attrs.response.track;
//     this.saveTrack({
//       echonest: attrs,      
//       title: attrs.title,
//       artist: attrs.artist,
//     });
//   }, 'setEchonest');

//   WaveSurfer.setSoundcloud = Utils.withErrorHandling(function(attrs) {
//     console.log("set soundcloud", attrs);
//     this.saveTrack({
//       soundcloud: attrs,
//       title: attrs.title,
//       artist: attrs.user && attrs.user.username,
//     });
//     this.load(this.getTrack().getSoundcloudUrl());
//   }, 'setSoundcloud');

//   WaveSurfer.loadMp3Tags = Utils.withErrorHandling(function(file) {
//     id3(file, function(err, tags) {
//       console.log("load tags", tags, file.name);
//       var newAttrs = {};
//       if (err) {
//         console.error(err);
//         newAttrs.title = file.name;
//       } else {
//         newAttrs.title = tags.title || file.name;
//         newAttrs.artist = tags.artist;
//         newAttrs.album = tags.album;
//         newAttrs.id3Tags = tags;
//       }
//       this.saveTrack(newAttrs);
//     }.bind(this));
//   }, 'loadMp3Tags');

//   WaveSurfer.saveTrack = Utils.withErrorHandling(function(attrs) {
//     var track = this.getTrack();
//     track._upsert(attrs);
//     this.refreshTrack();
//     return track;
//   }, 'saveTrack');

//   WaveSurfer.persistTrack = Utils.withErrorHandling(function() {
//     var track = this.getTrack();
//     track.persist();
//     this.loadTrack(track);
//     return track;
//   }, 'persistTrack');

//   WaveSurfer.refreshTrack = Utils.withErrorHandling(function() {
//     var track = this.getTrack();
//     track.refresh();
//     this.loadTrack(track);
//   }, 'refreshTrack');
//   //
//   // /Database Updates
//   //

//   WaveSurfer.loadTrack = Utils.withErrorHandling(function(track, streamUrl) {
//     console.log("load track", track, streamUrl);
//     if (track) {
//       track.refresh();
//       track.isLocal = track.isLocal();
//       this._setMeta(track);
//     }
//     if (streamUrl) {
//       this.load(streamUrl);
//     }
//   }, 'loadTrack');

//   // All reactive metadata for waves
//   WaveSurfer._setMeta = Utils.withErrorHandling(function(attrs) {
//     attrs = attrs || {};
//     this.meta.set(_.defaults({
//       _id: attrs._id,
//       isLocal: attrs.isLocal,
//       title: attrs.title,
//       artist: attrs.artist,
//       echonestAnalysis: attrs.echonestAnalysis,
//       linxType: attrs.linxType,
//       regions: attrs.regions,
//       mixPointIds: attrs.mixPointIds,
//       mixIn: attrs.mixIn,
//       mixOut: attrs.mixOut,
//     }, this.meta.get(), {
//     // defaults
//       regions: {},
//       mixPointIds: [],
//     }));
//   }, '_setMeta');

//   WaveSurfer.reset = Utils.withErrorHandling(function() {
//     var meta = this.meta && this.meta.get();
//     if (meta) {
//       this.meta.set(null);
//     }
//     this.loadingIntervals && this.loadingIntervals.forEach(function(interval) {
//       Meteor.clearInterval(interval);
//     });
//     this.loadingComputations && this.loadingComputations.forEach(function(computation) {
//       computation.stop();
//     });
//     this.empty();
//     this.fireEvent('reset');
//   }, 'reset');

// });
