var echoApiKey = 'CWBME38JDGQNEJPXT';

Meteor.startup(function() {
  Archive = new ReactiveVar();
  Archive.set([]);

  // hack to add archive of all active wavesurfers
  // WaveSurfer.create = function() {
  //   Archive.push(this);

  // }

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

  WaveSurfer.getPeaks = function() {
    var length;
    if (this.params.fillParent && !this.params.scrollParent) {
      length = this.drawer.getWidth();
    } else {
      length = Math.round(this.getDuration() * this.params.minPxPerSec * this.params.pixelRatio);
    }
    var peaks = this.backend.getPeaks(length);
    // coerce into object
    var peaksObject = {}
    _.each(peaks, function(peak, index) {
      peaksObject[index] = peak;
    });
    return peaksObject;
  }

});