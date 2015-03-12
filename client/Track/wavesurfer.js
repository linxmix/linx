// Augment WaveSurfer Prototype
Meteor.startup(function() {

  // hack to access the ArrayBuffer of audio data as it's read
  WaveSurfer.loadArrayBuffer = function(arraybuffer) {
    var my = this;
    this.backend.decodeArrayBuffer(arraybuffer, function (data) {
      my.loadDecodedBuffer(data);
      my.arrayBuffer = data;
    }, function () {
      my.fireEvent('error', 'Error decoding audiobuffer');
    });
  };
  // /hack

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

  WaveSurfer.getEchonestAnalysis = function(cb) {
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
      track.persist();
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
    var url = track.getS3Url();

    function onFinish() {
      if (cb) {
        cb();
      } else {
        wave.fireEvent('uploadFinish');
      }
    }

    function onProgress() {
      console.log("ON PROGRESS", arguments);
    };

    console.log("uploading wave to url: " + url);
    Meteor.call('putArray', new Uint8Array(wave.arrayBuffer), url, onProgress, onFinish);
  },

  WaveSurfer.loadTrack = function(track, streamUrl) {
    if (track) {
      this.setMeta({
        _id: track._id,
        isLocal: track.isLocal(),
        title: track.title,
        artist: track.artist,
        linxType: track.linxType,
      });
      console.log("load track", track, streamUrl);
      // set inverse relationship
      var wave = this;
      track.getWave = function() {
        return wave;
      };
    }
    if (streamUrl) {
      this.load(streamUrl);
    }
  };

  WaveSurfer.isLocal = function() {
    var isLocal = this.getMeta('isLocal');
    return (typeof isLocal === 'boolean') && isLocal;
  },

  WaveSurfer.isAnalyzed = function() {
    return !!this.getMeta('echonestAnalysis');
  },

  // All reactive metadata for waves
  WaveSurfer.setMeta = function(attrs) {
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

  WaveSurfer.getMeta = function(attr) {
    var meta = this.meta && this.meta.get();
    if (meta) {
      return meta[attr];
    }
  };

  WaveSurfer.getTrack = function() {
    var trackId = this.getMeta('_id');
    var linxType = this.getMeta('linxType');
    console.log("getTrack", trackId, linxType);
    if (trackId) {
      var collection = linxType === 'song' ? Songs : Transitions;
      return collection.findOne(trackId);
    }
  },

  WaveSurfer.reset = function() {
    var meta = this.meta && this.meta.get();
    if (meta) {
      this.setMeta(null);
    }
    this.empty();
    this.fireEvent('reset');
  };

});
