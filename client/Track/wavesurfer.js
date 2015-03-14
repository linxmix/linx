// Augment WaveSurfer Prototype
Meteor.startup(function() {

  //
  // Database Updates
  //
  WaveSurfer.setEchonest = function(attrs) {
    // TODO
    throw "Error: WaveSurfer.setEchonest unimplemented";
    this.saveTrack(attrs);
  },

  WaveSurfer.setSoundcloud = function(attrs) {
    var newAttrs = {};
    console.log("set soundcloud", attrs);
    newAttrs.soundcloud = attrs;
    newAttrs.title = attrs.title;
    newAttrs.artist = attrs.user && attrs.user.username;
    this.saveTrack(newAttrs);
    this.load(this.getTrack().getSoundcloudUrl());
  },

  WaveSurfer.loadMp3Tags = function(file) {
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
  },

  WaveSurfer.saveTrack = function(attrs) {
    var track = this.getTrack();
    track._upsert(attrs);
    this.refreshTrack();
    return track;
  },

  WaveSurfer.persistTrack = function() {
    var track = this.getTrack();
    track.persist();
    this.refreshTrack(track);
    return track;
  },

  WaveSurfer.refreshTrack = function(track) {
    this.loadTrack(track || this.getTrack());
  },
  //
  // /Database Updates
  //

  WaveSurfer.getSampleRegion = function(regionInfo) {
    var startRegion = regionInfo.start || 0;
    var endRegion = regionInfo.end || this.backend.buffer.length;
    var sampleSize = regionInfo.sampleSize || 1000;

    var buffer = this.backend.buffer;
    var chan = buffer.getChannelData(0);
    var length = Math.floor((endRegion - startRegion) / sampleSize);
    var samples = new Float32Array(length);

    // compute new samples in region
    for (var i = 0; i < length; i++) {
      var start = startRegion + ~~(i * sampleSize);
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
  };

  //
  // Network Calls
  //
  WaveSurfer.fetchEchonestAnalysis = function(cb) {
    var track = this.getTrack();
    if (!track) {
      throw 'Error: cannot get echonest analysis of a wave without a track';
    }
    if (this.isLocal()) {
      throw 'Error: cannot get echonest analysis of a local track';
    }
    if (this.isAnalyzed()) {
      throw 'Error: wave is already analyzed';
    }
    // TODO: try to get profile, fire uploading events while going
    //       -> upload to echo nest in multi-stage process.
    //       -> https://github.com/linxmix/linx/issues/347
    //       -> make sure this is idempotent
    var streamUrl = track.getStreamUrl();
    console.log("getting Echonest Analysis", streamUrl);

    // TODO: check if already have analysis
    this.fetchEchonestProfile(function() {
      // TODO: continue
    });


  },

  WaveSurfer.fetchEchonestProfile = function(cb) {
    var track = this.getTrack();
    if (!(track && track.getStreamUrl())) {
      throw 'Error: cannot get echonest profile of a wave without a track';
    }
    console.log("getting Echonest Profile");

    var streamUrl = track.getStreamUrl();
    // TODO: implement alreadyHave;
    if (!'alreadyHave') {
      cb && cb();
    } else {

      var wave = this;
      // TODO: set interval to call loading events
      wave.fireEvent('loading', 0, undefined, 'profile');
      $.ajax({
        type: "POST",
        url: 'http://developer.echonest.com/api/v4/track/upload',
        data: {
          api_key: Config.apiKey_Echonest,
          url: streamUrl
        },
        success: function(response) {
          wave.fireEvent('uploadFinish');
          wave.setEchonest(response);
          cb && cb();
        },
        error: function(xhr) {
          wave.fireEvent('error', 'echonest upload error: ' + xhr.responseText);
        },
      });

    }
  },

  WaveSurfer.uploadToBackend = function(cb) {
    var track = this.getTrack();
    if (!track) {
      throw 'Error: cannot upload a wave without a track';
    }
    if (!this.isLocal()) {
      throw 'Error: cannot upload a wave that is not local';
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
  },

  WaveSurfer._uploadToS3 = function(cb) {
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
    S3.upload(wave.files, track.getS3Prefix(), function(error, result) {
      if (error) {
        throw error;
      }
      console.log("RESULT", result);
      var s3FileName = result.relative_url.split('/')[1];
      wave.saveTrack({ s3FileName: s3FileName });
      wave.fireEvent('uploadFinish');
      cb && cb(error, result);
    });
  },
  //
  // /Network Calls
  //

  WaveSurfer.loadTrack = function(track, streamUrl) {
    console.log("load track", track, streamUrl);
    if (track) {
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
  };

  // All reactive metadata for waves
  WaveSurfer._setMeta = function(attrs) {
    attrs = attrs || {};
    this.meta && this.meta.set({
      _id: attrs._id,
      isLocal: attrs.isLocal,
      title: attrs.title,
      artist: attrs.artist,
      echonestAnalysis: attrs.echonestAnalysis,
      linxType: attrs.linxType,
    });
  };

  WaveSurfer.reset = function() {
    var meta = this.meta && this.meta.get();
    if (meta) {
      this._setMeta(null);
    }
    this.empty();
    this.fireEvent('reset');
  };

  //
  // Reactive functions
  //
  WaveSurfer.isLocal = function() {
    var isLocal = this.getMeta('isLocal');
    return (typeof isLocal === 'boolean') && isLocal;
  };

  WaveSurfer.isAnalyzed = function() {
    return !!this.getMeta('echonestAnalysis');
  };

  WaveSurfer.getMeta = function(attr) {
    var meta = this.meta && this.meta.get();
    if (meta) {
      return meta[attr];
    }
  };

  // Get a carbon copy of the track
  WaveSurfer.getTrack = function() {
    var trackId = this.getMeta('_id');
    var linxType = this.getMeta('linxType');
    if (trackId) {
      var collection = linxType === 'song' ? Songs : Transitions;
      return collection.findOne(trackId);
    }
  };
  //
  // /Reactive Functions
  //

});
