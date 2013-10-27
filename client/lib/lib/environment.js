try {
  audioContext = new(window.AudioContext || window.webkitAudioContext);
} catch (e) {
  alert("This browser does not support Web Audio API. Try the latest version of Chrome!");
}