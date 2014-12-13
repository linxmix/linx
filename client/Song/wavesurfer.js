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

  WaveSurfer.getLength = function() {
    var length;
    if (this.params.fillParent && !this.params.scrollParent) {
      length = this.drawer.getWidth();
    } else {
      length = Math.round(this.getDuration() * this.params.minPxPerSec * this.params.pixelRatio);
    }
    return length;
  }

  WaveSurfer.getPeaks = function() {
    return this.backend.getPeaks(this.getLength());
    // TODO: finish
    // coerce into object
    // var peaksObject = {}
    // _.each(peaks, function(peak, index) {
    //   peaksObject[index] = peak;
    // });
  }

});
