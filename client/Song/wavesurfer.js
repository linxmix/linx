
Meteor.startup(function() {
  console.log("startup", WaveSurfer);
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
});