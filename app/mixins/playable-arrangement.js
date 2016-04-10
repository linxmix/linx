import Ember from 'ember';

import ReadinessMixin from 'linx/mixins/readiness';
import RequireAttributes from 'linx/lib/require-attributes';
import withDefault from 'linx/lib/computed/with-default';
import Metronome from './playable-arrangement/metronome';
import WebAudioMergerNode from 'linx/lib/web-audio/merger-node';
import computedObject from 'linx/lib/computed/object';
import { flatten, isValidNumber } from 'linx/lib/utils';

// Interface for playable arrangements of clips
export default Ember.Mixin.create(
  RequireAttributes('clips', 'audioContext'),
  ReadinessMixin('isPlayableArrangementReady'), {

  // params
  playpause(beat) {
    this.get('metronome').playpause(beat);
  },

  play(beat) {
    this.get('metronome').play(beat);
  },

  pause() {
    this.get('metronome').pause();
  },

  stop() {
    this.pause();
    this.get('metronome').seekToBeat(0);
  },

  skipBack() {
    this.get('metronome').seekToBeat(0);
  },

  skipForth() {
    Ember.Logger.log("skip forth unimplemented");
  },

  seekToBeat(beat) {
    this.get('metronome').seekToBeat(beat);
  },

  // optional params
  outputNode: Ember.computed.reads('audioContext.destination'),
  bpm: 128.0,

  isPlaying: Ember.computed.reads('metronome.isPlaying'),

  metronome: computedObject(Metronome, {
    'audioContext': 'audioContext',
    'arrangement': 'this'
  }),

  // TODO(REFACTOR): arrangement shouldn't have to wait on clips? clips will just update when loaded
  isPlayableArrangementReady: true,
  // isPlayableArrangementReady: Ember.computed('readyClips.length', 'validClips.length', function() {
  //   return this.get('readyClips.length') >= this.get('validClips.length');
  // }),

  validClips: Ember.computed.filterBy('clips', 'isValid', true),
  readyClips: Ember.computed.filterBy('clips', 'isReady', true),
  // TODO(CLEANUP): why?
  // clipSort: ['endBeat:asc', 'startBeat:asc'],
  // sortedClips: Ember.computed.sort('clips', 'clipSort'),
  sortedClips: Ember.computed('clips.@each.endBeat', function() {
    return this.get('clips').sortBy('endBeat');
  }),
  timeSignature: 4,
  endBeat: Ember.computed.reads('sortedClips.lastObject.endBeat'),
  beatCount: withDefault('endBeat', 0),

  barCount: Ember.computed('beatCount', 'timeSignature', function() {
    return this.get('beatCount') / this.get('timeSignature');
  }),

  //
  // Web Audio Nodes
  //
  inputNode: computedObject(WebAudioMergerNode, {
    'audioContext': 'audioContext',
    'outputNode': 'outputNode',
  }),

  // fxNode: Ember.computed('audioContext', 'outputNode', function() {
  //   let { audioContext, outputNode } = this.getProperties('audioContext', 'outputNode');
  //   return FxNode.create({ audioContext, outputNode });
  // }),

  // nodes: Ember.computed.collect('inputNode', 'fxNode'),
  // controls: Ember.computed('nodes.@each.controls', function() {
  //   return flatten(this.get('nodes').mapBy('controls'));
  // }),

  // destroyNodes() {
  //   this.get('nodes').map((node) => { return node && node.destroy(); });
  // },

  // destroy() {
  //   this.get('metronome').destroy();
  //   this.destroyNodes();
  //   return this._super.apply(this, arguments);
  // },

  toString() {
    return '<linx@mixin:playable-arrangement>';
  }
});
