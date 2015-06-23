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

Wavesurfer.setTempo = function(tempo) {
  this.backend.setTempo(tempo);
};

Wavesurfer.setPitch = function(pitch) {
  this.backend.setPitch(pitch);
};

Wavesurfer.WebAudio.setTempo = function(tempo) {
  var prevTempo = this.linxTempo;
  if (typeof tempo !== 'number') {
    tempo = 1;
  }
  if (typeof prevTempo !== 'number') {
    prevTempo = 1;
  }

  var ratio = tempo / prevTempo;
  console.log("setting tempo", tempo, prevTempo, ratio);
  this.playbackRate = ratio;
  this.linxTempo = tempo;

  // update soundtouch tempo
  var soundtouch = this.soundtouch;
  if (soundtouch) {
    soundtouch.tempo = tempo;
  }
};

Wavesurfer.WebAudio.setPitch = function(pitch) {
  console.log("setting pitch", pitch);
  if (typeof pitch !== 'number') {
    pitch = 0;
  }

  this.linxPitch = pitch;

  // update soundtouch pitch
  var soundtouch = this.soundtouch;
  if (soundtouch) {
    soundtouch.pitchSemitones = pitch;
  }
}

// 'play' is equivalent to 'create and connect soundtouch source'
Wavesurfer.WebAudio.play = function(start, end) {
  if (!this.isPaused()) {
    this.pause();
  }

  var adjustedTime = this.seekTo(start, end);
  start = adjustedTime.start;
  end = adjustedTime.end;
  this.scheduledPause = end;
  var startPosition = ~~(start * this.ac.sampleRate);

  // init soundtouch
  this.soundtouch = new SoundTouch();
  this.setPitch(this.linxPitch);
  this.setTempo(this.linxTempo);

  // hook up soundtouch node
  this.soundtouchSource = new WebAudioBufferSource(this.buffer);
  this.soundtouchFilter = new SimpleFilter(this.soundtouchSource, this.soundtouch, startPosition);
  this.soundtouchNode = getWebAudioNode(this.ac, this.soundtouchFilter);
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