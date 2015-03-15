// Augment WaveSurfer Prototype
Meteor.startup(function() {

  function withErrorHandling(fn, name) {
    return function() {
      try {
        if (Session.get('debug')) {
          console.log("DEBUG: calling wavesurfer method '" + name + "' with args: ", arguments);
        }
        return fn.apply(this, arguments);
      } catch (error) {
        console.error(error.stack);
        this.fireEvent('error', error && error.message || error);
      }
    };
  }

  WaveSurfer.setLoadingInterval = withErrorHandling(function(type, xhr, time) {
    var percent = 0;
    var wave = this;
    var loadingInterval = Meteor.setInterval(function() {
      wave.fireEvent('loading', percent, undefined, type);
      if (percent === 100) {
        Meteor.clearInterval(loadingInterval);
      }
      percent += 1;
    }, time / 100);
    return loadingInterval;
  }, 'setLoadingInterval');

  WaveSurfer.getSampleRegion = withErrorHandling(function(regionId, sampleSize) {
    var wave = this;
    var targetRegion = wave.getRegion(regionId);

    // first compute start and end samples
    var startSample, endSample;
    if (targetRegion) {
      var sampleRate = wave.backend.buffer.sampleRate;
      startSample = Math.floor(targetRegion.start * sampleRate);
      endSample = Math.floor(targetRegion.end * sampleRate);
    } else {
      startSample = 0;
      endSample = wave.backend.buffer.length;
    }
    console.log("get sample region", targetRegion);

    var buffer = this.backend.buffer;
    var chan = buffer.getChannelData(0);
    var length = Math.floor((endSample - startSample) / sampleSize);
    var samples = new Float32Array(length);

    // compute new samples in region
    for (var i = 0; i < length; i++) {
      var start = startSample + ~~(i * sampleSize);
      var end = start + sampleSize;
      var avg = 0;
      // compute average in current sample
      for (var j = start; j < end; j++) {
        var value = chan[j];
        avg += Math.abs(value);
      }
      avg /= sampleSize;
      samples[i] = avg;
    }
    return samples;
  }, 'getSampleRegion');

  WaveSurfer.updateRegion = withErrorHandling(function(region) {
    var regions = this.getMeta('regions');
    regions[region.id] = region;
    this.setMeta({
      regions: regions,
    });
  }, 'setRegion');

  WaveSurfer.hasSelectedRegion = withErrorHandling(function(regionId) {
    return !!this.getRegion('selected');
  }, 'hasSelectedRegion');

  WaveSurfer.getRegion = withErrorHandling(function(regionId) {
    var regions = this.getMeta('regions');
    return regions[regionId];
  }, 'getRegion');

  WaveSurfer.getBufferLength = withErrorHandling(function() {
    return this.backend.buffer && this.backend.buffer.length;
  }, 'getBufferLength');

  // Returns time (ms) required to upload from source server to Echonest
  WaveSurfer.getCrossloadTime = withErrorHandling(function() {
    var bufferLength = this.getBufferLength();
    var SC_FACTOR = 1 / 3904; // milliseconds per buffer element
    var S3_FACTOR = 1 / 1936;
    var source = this.getTrack().getSource();
    var factor = (source === 'soundcloud') ? SC_FACTOR : S3_FACTOR;
    return factor * bufferLength;
  }, 'getCrossloadTime');

  //
  // Database Updates
  //
  WaveSurfer.setEchonest = withErrorHandling(function(attrs) {
    console.log("set echonest", attrs);
    attrs = attrs.response.track;
    this.saveTrack({
      echonest: attrs,      
      title: attrs.title,
      artist: attrs.artist,
    });
  }, 'setEchonest');

  WaveSurfer.setSoundcloud = withErrorHandling(function(attrs) {
    console.log("set soundcloud", attrs);
    this.saveTrack({
      soundcloud: attrs,
      title: attrs.title,
      artist: attrs.user && attrs.user.username,
    });
    this.load(this.getTrack().getSoundcloudUrl());
  }, 'setSoundcloud');

  WaveSurfer.loadMp3Tags = withErrorHandling(function(file) {
    id3(file, function(err, tags) {
      console.log("load tags", tags, file.name);
      var newAttrs = {};
      if (err) {
        console.error(err);
        newAttrs.title = file.name;
      } else {
        newAttrs.title = tags.title || file.name;
        newAttrs.artist = tags.artist;
        newAttrs.album = tags.album;
        newAttrs.id3Tags = tags;
      }
      this.saveTrack(newAttrs);
    }.bind(this));
  }, 'loadMp3Tags');

  WaveSurfer.saveTrack = withErrorHandling(function(attrs) {
    var track = this.getTrack();
    track._upsert(attrs);
    this.refreshTrack();
    return track;
  }, 'saveTrack');

  WaveSurfer.persistTrack = withErrorHandling(function() {
    var track = this.getTrack();
    track.persist();
    this.loadTrack(track);
    return track;
  }, 'persistTrack');

  WaveSurfer.refreshTrack = withErrorHandling(function() {
    var track = this.getTrack();
    track.refresh();
    this.loadTrack(track);
  }, 'refreshTrack');
  //
  // /Database Updates
  //

  WaveSurfer.loadTrack = withErrorHandling(function(track, streamUrl) {
    console.log("load track", track, streamUrl);
    if (track) {
      track.refresh();
      this._setMeta({
        _id: track._id,
        isLocal: track.isLocal(),
        title: track.title,
        artist: track.artist,
        linxType: track.linxType,
      });
    }
    if (streamUrl) {
      this.load(streamUrl);
    }
  }, 'loadTrack');

  // All reactive metadata for waves
  WaveSurfer._setMeta = withErrorHandling(function(attrs) {
    attrs = attrs || {};
    this.meta && this.meta.set(_.defaults({
      _id: attrs._id,
      isLocal: attrs.isLocal,
      title: attrs.title,
      artist: attrs.artist,
      echonestAnalysis: attrs.echonestAnalysis,
      linxType: attrs.linxType,
      regions: attrs.regions || {},
    }, this.meta.get()));
  }, '_setMeta');

  WaveSurfer.reset = withErrorHandling(function() {
    var meta = this.meta && this.meta.get();
    if (meta) {
      this.meta.set(null);
    }
    this.empty();
    this.fireEvent('reset');
  }, 'reset');

  //
  // Reactive functions
  //
  WaveSurfer.isLocal = withErrorHandling(function() {
    var isLocal = this.getMeta('isLocal');
    return (typeof isLocal === 'boolean') && isLocal;
  }, 'isLocal');

  WaveSurfer.isAnalyzed = withErrorHandling(function() {
    return !!this.getMeta('echonestAnalysis');
  }, 'isAnalyzed');

  WaveSurfer.isLoaded = withErrorHandling(function() {
    return this.loaded && this.loaded.get();
  }, 'isLoaded');

  WaveSurfer.isLoading = withErrorHandling(function() {
    return this.loading && this.loading.get();
  }, 'isLoading');

  WaveSurfer.getMeta = withErrorHandling(function(attr) {
    var meta = this.meta && this.meta.get();
    if (meta) {
      return meta[attr];
    }
  }, 'getMeta');

  // Get a carbon copy of the track
  WaveSurfer.getTrack = withErrorHandling(function() {
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

  //
  // Network Calls
  //
  WaveSurfer.fetchEchonestAnalysis = withErrorHandling(function(cb) {

    // If already have analysis, short circuit
    if (this.getMeta('echonestAnalysis')) {
      console.log("Track already has echonest analysis, skipping", track);
      cb && cb();
    } else {
      var wave = this;

      // fetch profile before analyzing
      this.fetchEchonestProfile(function() {
        var track = wave.getTrack();
        var loadingInterval;

        function onSuccess(response) {
          Meteor.clearInterval(loadingInterval);
          wave.fireEvent('uploadFinish');
          wave._setMeta({ echonestAnalysis: response });
          cb && cb();
        }

        // attempt 5 times with 3 seconds between each.
        var count = 0;
        function attempt() {
          loadingInterval = wave.setLoadingInterval('analyze', undefined, 3000);
          console.log("fetching echonest analysis: ", "attempt: " + count, track);

          $.ajax({
            type: "GET",
            url: track.echonest.audio_summary.analysis_url,
            success: onSuccess,
            error: function(xhr) {
              Meteor.clearInterval(loadingInterval);
              // retry on error
              if (count++ <= 5) {
                Meteor.setTimeout(attempt, 3000);
              } else {
                wave.fireEvent('error', 'echonest analysis error: ' + xhr.responseText);
              }
            },
          });
        }

        attempt();
      });
    }
  }, 'fetchEchonestAnalysis');

  WaveSurfer.fetchEchonestProfile = withErrorHandling(function(cb) {
    var wave = this;
    // first get echonestId of track
    this.fetchEchonestId(function(echonestId) {
      console.log("fetching echonest profile", wave.getTrack());
      var loadingInterval = wave.setLoadingInterval('profile', undefined, 2000);

      function onSuccess(response) {
        Meteor.clearInterval(loadingInterval);
        wave.fireEvent('uploadFinish');
        wave.setEchonest(response);
        cb && cb();
      }

      // send profile request
      $.ajax({
        type: "GET",
        url: 'http://developer.echonest.com/api/v4/track/profile',
        cache: false, // do not cache so we get a fresh analysis_url
        data: {
          api_key: Config.apiKey_Echonest,
          bucket: 'audio_summary',
          format: 'json',
          id: echonestId,
        },
        success: onSuccess,
        error: function(xhr) {
          Meteor.clearInterval(loadingInterval);
          wave.fireEvent('error', 'echonest profile error: ' + xhr.responseText);
        },
      });      
    });
  }, 'fetchEchonestProfile');

  WaveSurfer.fetchEchonestId = withErrorHandling(function(cb) {
    if (this.isLocal()) {
      throw new Error('Cannot get echonestId of a wave without saving to backend first', this);
    }

    // short-circuit if we already have the id
    var track = this.getTrack();
    if (track.echonest) {
      console.log("track already has echonest id, skipping", track);
      cb && cb(track.echonest.id);
    } else {
      console.log("getting echonestId of track", track);
      var wave = this;
      var streamUrl = track.getStreamUrl();
      var loadingInterval = wave.setLoadingInterval('profile', undefined, this.getCrossloadTime());

      function onSuccess(response) {
        Meteor.clearInterval(loadingInterval);
        wave.fireEvent('uploadFinish');
        cb && cb(response.response.track.id);
      }

      // start upload
      $.ajax({
        type: "POST",
        url: 'http://developer.echonest.com/api/v4/track/upload',
        data: {
          api_key: Config.apiKey_Echonest,
          url: streamUrl
        },
        success: onSuccess,
        error: function(xhr) {
          Meteor.clearInterval(loadingInterval);
          wave.fireEvent('error', 'echonest upload error: ' + xhr.responseText);
        },
      });
    }
  }, 'fetchEchonestId');

  WaveSurfer.uploadToBackend = withErrorHandling(function(cb) {
    var track = this.getTrack();
    if (!track) {
      throw new Error('Cannot upload a wave without a track', this);
    }
    if (!this.isLocal()) {
      throw new Error('Cannot upload a wave that is not local', this);
    }

    // on completion, persist track and fire finish event
    var wave = this;
    function next() {
      wave.persistTrack();
      wave.fireEvent('uploadFinish');
      cb && cb();
    }

    // upload to appropriate backend
    switch (track.getSource()) {
      case 's3': this._uploadToS3(next); break;
      case 'soundcloud': next(); break; // already exists on SC
      default: throw "Error: unknown track source: " + track.getSource();
    }
  }, 'uploadToBackend');

  WaveSurfer._uploadToS3 = withErrorHandling(function(cb) {
    var wave = this;
    var track = wave.getTrack();

    // track progress
    Tracker.autorun(function(computation) {
      var uploads = S3.collection.find().fetch();
      var upload = uploads[0];
      if (upload) {
        wave.fireEvent('loading', upload.percent_uploaded, undefined, 'upload');
        if (upload.percent_uploaded === 100) {
          computation.stop();
        }
      }
    });

    console.log("uploading wave", this.getMeta('title'));
    S3.upload({
      files: wave.files,
      path: track.getS3Prefix(),
    }, function(error, result) {
      if (error) { throw error; }
      console.log("RESULT", result);
      var s3FileName = result.relative_url.split('/')[1];
      wave.saveTrack({ s3FileName: s3FileName });
      wave.fireEvent('uploadFinish');
      cb && cb(error, result);
    });
  }, '_uploadToS3');
  //
  // /Network Calls
  //

});
