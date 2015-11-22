import Ember from 'ember';

import AudioSourceNode from './audio-source-node';
import RequireAttributes from 'linx/lib/require-attributes';

export default AudioSourceNode.extend(
  RequireAttributes('track'), {

  trackAudioBinary: Ember.computed.reads('track.audioBinary'),
  decodedArrayBuffer: Ember.computed.reads('trackAudioBinary.decodedArrayBuffer.content'),
});
