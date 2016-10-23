import Ember from 'ember';

import BufferSourceNode from './buffer-source-node';
import RequireAttributes from 'linx/lib/require-attributes';

export default BufferSourceNode.extend({

  // params
  track: null,

  // implement audio-source-node
  audioBinary: Ember.computed.reads('track.audioBinary'),
  audioBuffer: Ember.computed.reads('audioBinary.audioBuffer'),

  toString() {
    return '<linx@object-proxy:web-audio/track-source-node>';
  },
});
