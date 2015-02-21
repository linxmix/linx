var echoApiKey = 'CWBME38JDGQNEJPXT';

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

});
