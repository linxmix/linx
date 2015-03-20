// Augment WaveSurfer Prototype
Meteor.startup(function() {

  WaveSurfer.getSampleRegion = Utils.withErrorHandling(function(regionId, sampleSize) {
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

  WaveSurfer._updateRegion = Utils.withErrorHandling(function(region) {
    var regions = this.getMeta('regions');
    if (region && region.id) {
      regions[region.id] = region;
      this._setMeta({
        regions: regions,
      });
    }
  }, 'setRegion');

  WaveSurfer.getBufferLength = Utils.withErrorHandling(function() {
    return this.backend.buffer && this.backend.buffer.length;
  }, 'getBufferLength');

  // Returns time (ms) required to upload from source server to Echonest
  WaveSurfer.getCrossloadTime = Utils.withErrorHandling(function() {
    var bufferLength = this.getBufferLength();
    var SC_FACTOR = 1 / 3904; // milliseconds per buffer element
    var S3_FACTOR = 1 / 1936;
    var source = this.getTrack().getSource();
    var factor = (source === 'soundcloud') ? SC_FACTOR : S3_FACTOR;
    return factor * bufferLength;
  }, 'getCrossloadTime');

});
