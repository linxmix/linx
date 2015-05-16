// http://www.html5rocks.com/en/tutorials/workers/basics/

this.addEventListener('message', function(e) {
  var data = e.data;

  switch (data.cmd) {
    case 'start':
      self.postMessage('WORKER STARTED: ' + data.msg);
      break;
    case 'stop':
      self.postMessage('WORKER STOPPED: ' + data.msg +
                       '. (buttons will no longer work)');
      self.close(); // Terminates the worker.
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);

// decodeArrayBuffer: function (arraybuffer, callback, errback) {
//         if (!this.offlineAc) {
//             this.offlineAc = this.getOfflineAudioContext(this.ac ? this.ac.sampleRate : 44100);
//         }
//         this.offlineAc.decodeAudioData(arraybuffer, (function (data) {
//             callback(data);
//         }).bind(this), errback);
//     },
