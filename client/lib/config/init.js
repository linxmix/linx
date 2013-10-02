//
// init
//

// mixer inits
try {
  audioContext = new(window.AudioContext || window.webkitAudioContext);
} catch (e) {
  alert("This browser does not support Web Audio API. Try the lastest version of Chrome!");
}
BUFFER_LOAD_SPEED = 1000000; // bytes/sec
Session.set("load_time", 50.0); // safety net for load times
Session.set("queue", []);
