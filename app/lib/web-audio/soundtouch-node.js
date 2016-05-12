import Ember from 'ember';

import {
  default as Soundtouch,
  SoundtouchFilter,
  SoundtouchBufferSource,
  createSoundtouchNode
} from 'linx/lib/soundtouch';

import WebAudioNodeMixin from 'linx/mixins/web-audio/node';
import { isValidNumber } from 'linx/lib/utils';

export default Ember.ObjectProxy.extend(
  WebAudioNodeMixin, {

  // required params
  audioBuffer: null,

  // implement web-audio/node
  node: null, // set by `start` method, unset by `disconnect`
  outputNode: null,

  // TODO(V2): tempo, transpose dynamic
  start(startTime, offsetTime, endTime, tempo, transpose) {
    // Ember.Logger.log('currentTime', this.get('audioContext.currentTime'));
    // Ember.Logger.log('startSource', startTime, offsetTime);
    this.stop();
    const { audioContext, soundtouchFilter } = this.getProperties('audioContext', 'soundtouchFilter');

    // web audio buffer sources can only be played once
    // therefore we must recreate source on each playback
    if (audioContext && soundtouchFilter) {
      const node = createSoundtouchNode({
        audioContext,
        filter: soundtouchFilter,
        startTime,
        offsetTime,
        endTime,
        defaultTempo: tempo,
        defaultPitch: transpose,
      });
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

  toString() {
    return '<linx@object-proxy:web-audio/soundtouch-node>';
  },
});
