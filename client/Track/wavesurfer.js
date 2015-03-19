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
    wave.loadingIntervals.push(loadingInterval);
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

  WaveSurfer._updateRegion = withErrorHandling(function(region) {
    var regions = this.getMeta('regions');
    if (region && region.id) {
      regions[region.id] = region;
      this._setMeta({
        regions: regions,
      });
    }
  }, 'setRegion');

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
      track.isLocal = track.isLocal();
      this._setMeta(track);
    }
    if (streamUrl) {
      this.load(streamUrl);
    }
  }, 'loadTrack');

  // All reactive metadata for waves
  WaveSurfer._setMeta = withErrorHandling(function(attrs) {
    attrs = attrs || {};
    this.meta.set(_.defaults({
      _id: attrs._id,
      isLocal: attrs.isLocal,
      title: attrs.title,
      artist: attrs.artist,
      echonestAnalysis: attrs.echonestAnalysis,
      linxType: attrs.linxType,
      regions: attrs.regions,
      mixPointIds: attrs.mixPointIds,
    }, this.meta.get(), {
    // defaults
      regions: {},
      mixPointIds: [],
    }));
  }, '_setMeta');

  WaveSurfer.reset = withErrorHandling(function() {
    var meta = this.meta && this.meta.get();
    if (meta) {
      this.meta.set(null);
    }
    this.loadingIntervals && this.loadingIntervals.forEach(function(interval) {
      Meteor.clearInterval(interval);
    });
    this.loadingComputations && this.loadingComputations.forEach(function(computation) {
      computation.stop();
    });
    this.empty();
    this.fireEvent('reset');
  }, 'reset');

  //
  // Reactive functions
  //
  WaveSurfer.setMixIn = withErrorHandling(function(id) {
    var prevId = this.getMeta('mixIn');
    if (id !== prevId) {
      // add if not already there
      if (id && !this.hasMixPoint(id)) {
        this.addMixPoint(id);
      }
      this._setMeta({ mixIn: id });
    }
    // TODO: setup trigger regions, based on mixPoint

  }, 'setMixIn');

  WaveSurfer.setMixOut = withErrorHandling(function(id) {
    // TODO
  }, 'setMixOut');

  WaveSurfer.persistMixPoints = withErrorHandling(function() {
    // TODO: delete deleted mix points?
    // save mix points
    this.getMixPoints().forEach(function(mixPoint) {
      mixPoint.persist();
    });
    // save track references
    this.saveTrack({ mixPointIds: this.getMeta('mixPointIds') });
  }, 'persistMixPoints');

  WaveSurfer.addMixPoint = withErrorHandling(function(id) {
    var mixPointIds = this.getMeta('mixPointIds');
    mixPointIds.push(id);
    this._setMeta({ mixPointIds: mixPointIds });
  }, 'addMixPoint');

  WaveSurfer.drawMixPoints = function() {
    var wave = this;
    this.getMixPoints().forEach(function(mixPoint, i) {
      var color;
      // switch (i) {
      //   case 0: color = 'rgba(255, 0, 0, 1)'; break;
      //   case 1: color = 'rgba(0, 255, 0, 1)'; break;
      //   case 2: color = 'rgba(0, 0, 255, 1)'; break;
      //   default: color = 'rgba(255, 255, 0, 1)'; break;
      // }

      switch (i) {
        case 0: color = '#2ecc40'; break;
        case 1: color = '#ff695e'; break;
        case 2: color = '#54c8ff'; break;
        default: color = 'rgba(255, 255, 0, 1)'; break;
      }

      if (!wave.getRegion(mixPoint.id)) {
        wave.regions.add({
          id: mixPoint.id,
          start: mixPoint.startIn, // TODO
          resize: false,
          loop: false,
          drag: false,
          color: color,
        });
      }
    });
  };

  // TODO: autorun drawing mixpoints on mixpoints change
  //       which half (in or out) of mixPoint to draw depends on inId and outId

  // does not delete MixPoint models
  WaveSurfer.removeMixPoint = withErrorHandling(function(id) {
    if (this.hasMixPoint(id)) {
      // possibly remove from mixIn and mixOut
      if (this.getMeta('mixIn') === id) {
        this.setMixIn(null);
      }
      if (this.getMeta('mixOut') === id) {
        this.setMixOut(null);
      }

      var mixPointIds = this.getMeta('mixPointIds');
      mixPointIds = mixPointIds.filter(function(existingId) {
        return id !== existingId;
      });
      this._setMeta({ mixPointIds: mixPointIds });
    }
  }, 'removeMixPoint');

  WaveSurfer.hasMixPoint = withErrorHandling(function(id) {
    return !!_.find(this.getMeta('mixPointIds'), function(mixPointId) {
      return mixPointId === id;
    });
  }, 'hasMixPoint');

  WaveSurfer.getMixPoints = withErrorHandling(function() {
    return (this.getMeta('mixPointIds') || []).map(function(id) {
      return MixPoints.findOne(id);
    });
  }, 'getMixPoints');

  WaveSurfer.hasSelectedRegion = withErrorHandling(function() {
    return !!this.getRegion('selected');
  }, 'hasSelectedRegion');

  WaveSurfer.getRegion = withErrorHandling(function(regionId) {
    var regions = this.getMeta('regions');
    return regions[regionId];
  }, 'getRegion');

  WaveSurfer.isLocal = withErrorHandling(function() {
    var isLocal = this.getMeta('isLocal');
    return (typeof isLocal === 'boolean') && isLocal;
  }, 'isLocal');

  WaveSurfer.getAnalysis = withErrorHandling(function() {
    return this.getMeta('echonestAnalysis');
  }, 'getAnalysis');

  WaveSurfer.isAnalyzed = withErrorHandling(function() {
    return !!this.getAnalysis();
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
      // add to wave computations if doesn't already exist
      wave.addLoadingComputation(computation);
    });

    console.log("uploading wave", this.getMeta('title'));
    S3.upload({
      files: wave.files,
      path: track.getS3Prefix(),
    }, function(error, result) {
      if (error) { throw error; }
      if (!wave.getTrack()) { return; }
      var urlParts = result.relative_url.split('/');
      var s3FileName = urlParts[urlParts.length - 1];
      wave.saveTrack({ s3FileName: s3FileName });
      wave.fireEvent('uploadFinish');
      cb && cb(error, result);
    });
  }, '_uploadToS3');
  //
  // /Network Calls
  //

  WaveSurfer.addLoadingComputation = withErrorHandling(function(computation) {
    var computations = this.loadingComputations = this.loadingComputations || [];
    if (computations.indexOf(computation) < 0) {
      computations.push(computation);
    }
  }, 'addLoadingComputation');

});
