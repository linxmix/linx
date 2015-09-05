/* global SimpleFilter:true */

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

augment('zoom', function(pxPerSec) {
  this.params.minPxPerSec = pxPerSec;

  // DKANE CHANGE: don't change scrollParent (???)
  // this.params.scrollParent = true;

  this.drawBuffer();

  this.seekAndCenter(this.getCurrentTime() / this.getDuration());
}),

augment('seekToTime', function(time) {
  // console.log("wavesurfer seekToTime", time);
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
  // console.log("setting tempo", tempo);
  if (typeof tempo !== 'number' || !tempo) {
    tempo = 1;
  }

  // update startPosition and lastPlay for new tempo
  this.startPosition += this.getPlayedTime();
  this.lastPlay = this.ac.currentTime;

  this.linxTempo = this.playbackRate = tempo;

  // update soundtouch tempo
  var soundtouch = this.soundtouch;
  if (soundtouch) {
    soundtouch.tempo = tempo;
  }
};

Wavesurfer.WebAudio.setPitch = function(pitch) {
  // console.log("setting pitch", pitch);

  // TODO: remove this check, only for two-way binding to input
  try {
    pitch = parseFloat(pitch);
  } catch(e) {

  }
  if (typeof pitch !== 'number') {
    pitch = 0;
  }

  this.linxPitch = pitch;

  // update soundtouch pitch
  var soundtouch = this.soundtouch;
  if (soundtouch) {
    soundtouch.pitchSemitones = pitch;
  }
};

// 'play' is equivalent to 'create and connect soundtouch source'
Wavesurfer.WebAudio.play = function(start, end) {
  if (!this.isPaused()) {
    this.pause();
  }

  var adjustedTime = this.seekTo(start, end);
  start = adjustedTime.start;
  end = adjustedTime.end;
  this.scheduledPause = end;
  var startSample = ~~(start * this.ac.sampleRate);

  // init soundtouch
  this.soundtouch = new SoundTouch();
  this.setPitch(this.linxPitch);
  this.setTempo(this.linxTempo);

  // hook up soundtouch node
  this.soundtouchSource = new WebAudioBufferSource(this.buffer);
  this.soundtouchFilter = new SimpleFilter(this.soundtouchSource, this.soundtouch);
  this.soundtouchFilter.sourcePosition = startSample;
  this.soundtouchNode = getWebAudioNode(this.ac, this.soundtouchFilter);
  this.soundtouchNode.connect(this.analyser);

  this.setState(this.PLAYING_STATE);
  this.fireEvent('play');
};

// 'pause' is equivalent to 'disconnect soundtouch source'
Wavesurfer.WebAudio.pause = function() {
  this.scheduledPause = null;
  this.startPosition += this.getPlayedTime();

  this.soundtouchNode && this.soundtouchNode.disconnect();

  this.setState(this.PAUSED_STATE);
};

// turn into no-op
Wavesurfer.WebAudio.createSource = function() {};

export default Wavesurfer;
