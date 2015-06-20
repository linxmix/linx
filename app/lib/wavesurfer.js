import Wavesurfer from 'npm:wavesurfer.js';
import SoundTouch from 'linx/lib/soundtouch';
import { WebAudioBufferSource, getWebAudioNode } from 'linx/lib/soundtouch';

//
// DKANE Augment Wavesurfer Functions
//
function augment(property, fn) {
  if (Wavesurfer[property]) {
    console.log("Wavesurfer." + property + " exists, deprecate mine");
  } else {
    Wavesurfer[property] = fn;
  }
}

augment('seekToTime', function(time) {
  return this.seekTo(time / this.getDuration());
});

augment('isPlaying', function() {
  return !this.backend.isPaused();
});

//
// Wavesurfer + SoundTouch Integration
//

// 'play' is equivalent to 'create and connect soundtouch source'
// TODO: figure out tempo change + wavesurfer.playbackRate
Wavesurfer.WebAudio.play = function(start, end) {
  var adjustedTime = this.seekTo(start, end);
  start = adjustedTime.start;
  end = adjustedTime.end;
  this.scheduledPause = end;

  // hook up soundtouch node
  var startPosition = ~~(start * this.ac.sampleRate);

  this.soundtouch = new SoundTouch();
  this.soundtouchSource = new WebAudioBufferSource(this.buffer);
  this.soundtouchFilter = new SimpleFilter(this.soundtouchSource, this.soundtouch, startPosition);
  this.soundtouchNode = getWebAudioNode(this.ac, this.soundtouchFilter);

  // TODO: make not static
  this.soundtouch.pitchSemitones = 1;

  this.soundtouchNode.connect(this.analyser);

  this.setState(this.PLAYING_STATE);
};

// 'pause' is equivalent to 'disconnect soundtouch source'
Wavesurfer.WebAudio.pause = function() {
  this.scheduledPause = null;
  this.startPosition += this.getPlayedTime();

  this.soundtouchNode && this.soundtouchNode.disconnect();

  this.setState(this.PAUSED_STATE);
}

// turn into no-op
Wavesurfer.WebAudio.createSource = function() {};

export default Wavesurfer;
