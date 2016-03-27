import Ember from 'ember';

import {
  default as Soundtouch,
  SoundtouchFilter,
  SoundtouchBufferSource,
  createSoundtouchScriptNode
} from 'linx/lib/soundtouch';

import WebAudioNodeMixin from 'linx/mixins/web-audio/node';
import { isValidNumber } from 'linx/lib/utils';

export default Ember.ObjectProxy.extend(
  WebAudioNodeMixin, {

  // required params
  audioBpm: null,
  audioBuffer: null,

  // optional params
  pitch: 0, // semitones
  bpm: Ember.computed.reads('audioBpm'),

  // implement web-audio/node
  node: null, // set by `start` method, unset by `disconnect`
  outputNode: null,

  start(when, offset, duration) {
    // Ember.Logger.log('currentTime', this.get('audioContext.currentTime'));
    // Ember.Logger.log('startSource', when, offset);
    this.stop();
    const { audioContext, soundtouchFilter } = this.getProperties('audioContext', 'soundtouchFilter');

    // web audio buffer sources can only be played once
    // therefore we must recreate source on each playback
    if (audioContext && soundtouchFilter) {
      const node = createSoundtouchScriptNode(audioContext, soundtouchFilter, when, offset, duration);
      this.set('node', node);
      this.connectOutput();
    }
  },

  stop() {
    this.disconnect();
  },

  soundtouch: Ember.computed(() => new Soundtouch()),

  soundtouchSource: Ember.computed('audioBuffer', function() {
    return new SoundtouchBufferSource(this.get('audioBuffer'));
  }),

  soundtouchFilter: Ember.computed('soundtouch', 'soundtouchSource', function() {
    const { soundtouch, soundtouchSource } = this.getProperties('soundtouch', 'soundtouchSource');
    if (soundtouch && soundtouchSource) {
      return new SoundtouchFilter(soundtouchSource, soundtouch);
    }
  }),

  // TODO(REFACTOR2): make updates happen with direct sets on 'pitch' and 'bpm'?
  updateTempo: Ember.observer('bpm', 'audioBpm', 'soundtouch', function() {
    const { bpm, audioBpm, soundtouch } = this.getProperties('bpm', 'audioBpm');

    let tempo = 1;
    if (isValidNumber(bpm) && isValidNumber(audioBpm)) {
      tempo = bpm / audioBpm;
    }

    Ember.Logger.log("setting tempo", tempo);
    if (soundtouch) {
      soundtouch.tempo = tempo;
    }
  }),

  updatePitch: Ember.observer('pitch', 'soundtouch', function() {
    const { pitch, soundtouch } = this.getProperties('pitch', 'soundtouch');

    Ember.Logger.log("setting pitch", pitch);
    if (soundtouch && isValidNumber(pitch)) {
      soundtouch.pitchSemitones = pitch;
    }
  }),

  toString() {
    return '<linx@object-proxy:web-audio/soundtouch-node>';
  },
});
