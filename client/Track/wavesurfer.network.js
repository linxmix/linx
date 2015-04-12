// // Augment WaveSurfer Prototype
// Meteor.startup(function() {

//   WaveSurfer.addLoadingComputation = Utils.withErrorHandling(function(computation) {
//     var computations = this.loadingComputations = this.loadingComputations || [];
//     if (computations.indexOf(computation) < 0) {
//       computations.push(computation);
//     }
//   }, 'addLoadingComputation');

//   WaveSurfer.setLoadingInterval = Utils.withErrorHandling(function(type, xhr, time) {
//     var percent = 0;
//     var wave = this;
//     var loadingInterval = Meteor.setInterval(function() {
//       wave.fireEvent('loading', percent, undefined, type);
//       if (percent === 100) {
//         Meteor.clearInterval(loadingInterval);
//       }
//       percent += 1;
//     }, time / 100);
//     wave.loadingIntervals.push(loadingInterval);
//     return loadingInterval;
//   }, 'setLoadingInterval');

//   //
//   // Network Calls
//   //
//   WaveSurfer.fetchEchonestAnalysis = Utils.withErrorHandling(function(cb) {

//     // If already have analysis, short circuit
//     if (this.getMeta('echonestAnalysis')) {
//       console.log("Track already has echonest analysis, skipping", this.getMeta('name'));
//       cb && cb();
//     } else {
//       var wave = this;

//       // fetch profile before analyzing
//       this.fetchEchonestProfile(function() {
//         var track = wave.getTrack();
//         var loadingInterval;

//         function onSuccess(response) {
//           Meteor.clearInterval(loadingInterval);
//           wave.fireEvent('uploadFinish');
//           wave._setMeta({ echonestAnalysis: response });
//           cb && cb();
//         }

//         // attempt 5 times with 3 seconds between each.
//         var count = 0;
//         function attempt() {
//           loadingInterval = wave.setLoadingInterval('analyze', undefined, 3000);
//           console.log("fetching echonest analysis: ", "attempt: " + count, track);

//           $.ajax({
//             type: "GET",
//             url: track.echonest.audio_summary.analysis_url,
//             success: onSuccess,
//             error: function(xhr) {
//               Meteor.clearInterval(loadingInterval);
//               // retry on error
//               if (count++ <= 5) {
//                 Meteor.setTimeout(attempt, 3000);
//               } else {
//                 wave.fireEvent('error', 'echonest analysis error: ' + xhr.responseText);
//               }
//             },
//           });
//         }

//         attempt();
//       });
//     }
//   }, 'fetchEchonestAnalysis');

//   WaveSurfer.fetchEchonestProfile = Utils.withErrorHandling(function(cb) {
//     var wave = this;
//     // first get echonestId of track
//     this.fetchEchonestId(function(echonestId) {
//       console.log("fetching echonest profile", wave.getTrack());
//       var loadingInterval = wave.setLoadingInterval('profile', undefined, 2000);

//       function onSuccess(response) {
//         Meteor.clearInterval(loadingInterval);
//         wave.fireEvent('uploadFinish');
//         wave.setEchonest(response);
//         cb && cb();
//       }

//       // send profile request
//       $.ajax({
//         type: "GET",
//         url: 'http://developer.echonest.com/api/v4/track/profile',
//         cache: false, // do not cache so we get a fresh analysis_url
//         data: {
//           api_key: Config.apiKey_Echonest,
//           bucket: 'audio_summary',
//           format: 'json',
//           id: echonestId,
//         },
//         success: onSuccess,
//         error: function(xhr) {
//           Meteor.clearInterval(loadingInterval);
//           wave.fireEvent('error', 'echonest profile error: ' + xhr.responseText);
//         },
//       });      
//     });
//   }, 'fetchEchonestProfile');

//   WaveSurfer.fetchEchonestId = Utils.withErrorHandling(function(cb) {
//     if (this.isLocal()) {
//       throw new Error('Cannot get echonestId of a wave without saving to backend first', this);
//     }

//     // short-circuit if we already have the id
//     var track = this.getTrack();
//     if (track.echonest) {
//       console.log("track already has echonest id, skipping", track);
//       cb && cb(track.echonest.id);
//     } else {
//       console.log("getting echonestId of track", track);
//       var wave = this;
//       var streamUrl = track.getStreamUrl();
//       var loadingInterval = wave.setLoadingInterval('profile', undefined, this.getCrossloadTime());

//       function onSuccess(response) {
//         Meteor.clearInterval(loadingInterval);
//         wave.fireEvent('uploadFinish');
//         cb && cb(response.response.track.id);
//       }

//       // start upload
//       $.ajax({
//         type: "POST",
//         url: 'http://developer.echonest.com/api/v4/track/upload',
//         data: {
//           api_key: Config.apiKey_Echonest,
//           url: streamUrl
//         },
//         success: onSuccess,
//         error: function(xhr) {
//           Meteor.clearInterval(loadingInterval);
//           wave.fireEvent('error', 'echonest upload error: ' + xhr.responseText);
//         },
//       });
//     }
//   }, 'fetchEchonestId');

//   WaveSurfer.uploadToBackend = Utils.withErrorHandling(function(cb) {
//     var track = this.getTrack();
//     if (!track) {
//       throw new Error('Cannot upload a wave without a track', this);
//     }
//     if (!this.isLocal()) {
//       throw new Error('Cannot upload a wave that is not local', this);
//     }

//     // on completion, persist track and fire finish event
//     var wave = this;
//     function next() {
//       wave.persistTrack();
//       wave.fireEvent('uploadFinish');
//       cb && cb();
//     }

//     // upload to appropriate backend
//     switch (track.getSource()) {
//       case 's3': this._uploadToS3(next); break;
//       case 'soundcloud': next(); break; // already exists on SC
//       default: throw "Error: unknown track source: " + track.getSource();
//     }
//   }, 'uploadToBackend');

//   WaveSurfer._uploadToS3 = Utils.withErrorHandling(function(cb) {
//     var wave = this;
//     var track = wave.getTrack();

//     // track progress
//     Tracker.autorun(function(computation) {
//       var uploads = S3.collection.find().fetch();
//       var upload = uploads[0];
//       if (upload) {
//         wave.fireEvent('loading', upload.percent_uploaded, undefined, 'upload');
//         if (upload.percent_uploaded === 100) {
//           computation.stop();
//         }
//       }
//       // add to wave computations if doesn't already exist
//       wave.addLoadingComputation(computation);
//     });

//     console.log("uploading wave", this.getMeta('title'));
//     S3.upload({
//       files: wave.files,
//       path: track.getS3Prefix(),
//     }, function(error, result) {
//       if (error) { throw error; }
//       if (!wave.getTrack()) { return; }
//       var urlParts = result.relative_url.split('/');
//       var s3FileName = urlParts[urlParts.length - 1];
//       wave.saveTrack({ s3FileName: s3FileName });
//       wave.fireEvent('uploadFinish');
//       cb && cb(error, result);
//     });
//   }, '_uploadToS3');
//   //
//   // /Network Calls
//   //

// });
