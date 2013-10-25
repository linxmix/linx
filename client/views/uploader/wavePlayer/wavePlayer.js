Template.wavePlayer.rendered = function () {
  var id = this.data.id;
  var wave = Uploader.waves[id];

  // make sure only to run the init once
  if (wave.initialized) { return; }

  // set up volume slider
  var volumeSlider = $(this.find('.volumeSlider'));
  volumeSlider.slider({
    'min': 0,
    'max': this.data.isSongWave ? 1.0 : 1.25,
    'step': 0.01,
    'value': this.data.isSongWave ? 0.8 : 1.0,
  })
  .on('slide', function(ev) {
    wave.setVolume(ev.value);
  });

  // set up zoom slider
  var zoomSlider = $(this.find('.zoomSlider'));
  zoomSlider.slider({
    'min': 1,
    'max': 100,
    'step': 1,
    'handle': 'triangle',
  })
  .on('slide', function(ev) {
    Wave.zoom(Uploader.waves[id], ev.value);
  });
};