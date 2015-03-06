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

  WaveSurfer.loadTrack = function(track, streamUrl) {
    if (track) {
      var source = track.getSource();
      this.setMeta({
        _id: track._id,
        title: track.title,
        artist: track.artist,
        source: source,
        linxType: track.getLinxType(),
      });
      console.log("LOAD TRACK", this.meta.get());
    }
    if (streamUrl) {
      this.load(streamUrl);
    }
  };

  WaveSurfer.setMeta = function(attrs) {
    this.meta.set({
      _id: attrs._id,
      title: attrs.title,
      artist: attrs.artist,
      source: attrs.source,
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
    if (trackId && linxType) {
      switch (linxType) {
        case 'song': return Songs.findOne(trackId);
        case 'transition': return Transitions.findOne(trackId);
      }
    }
  },

  WaveSurfer.reset = function() {
    var meta = this.meta && this.meta.get();
    if (meta) {
      this.meta.set({});
    }
    this.empty();
  };

  // Hack to add empty event
  var _empty = WaveSurfer.empty;
  WaveSurfer.empty = function() {
    _empty.apply(this, arguments);
    this.fireEvent('empty');
  };

});
