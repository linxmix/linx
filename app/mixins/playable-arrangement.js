import Ember from 'ember';

import ReadinessMixin from 'linx/mixins/readiness';
import RequireAttributes from 'linx/lib/require-attributes';
import withDefault from 'linx/lib/computed/with-default';
import Metronome from './playable-arrangement/metronome';
import WebAudioMergerNode from 'linx/lib/web-audio/merger-node';
import { flatten } from 'linx/lib/utils';

// Interface for playable arrangements of clips
export default Ember.Mixin.create(
  RequireAttributes('clips', 'audioContext'),
  ReadinessMixin('isPlayableArrangementReady'), {

  // params
  // TODO(REFACTOR): who connects arrangement to output?
  outputNode: null,

  metronome: Ember.computed('audioContext', function() {
    return Metronome.create({ audioContext: this.get('audioContext') });
  }),

  isPlayableArrangementReady: Ember.computed('readyClips.length', 'validClips.length', function() {
    return this.get('readyClips.length') >= this.get('validClips.length');
  }),

  validClips: Ember.computed.filterBy('clips', 'isValid', true),
  readyClips: Ember.computed.filterBy('clips', 'isReady', true),
  clipSort: ['endBeat:asc', 'startBeat:asc'],
  sortedClips: Ember.computed.sort('clips', 'clipSort'),
  timeSignature: Ember.computed.reads('arrangement.timeSignature'),
  endBeat: Ember.computed.reads('sortedClips.lastObject.endBeat'),
  beatCount: withDefault('endBeat', 0),

  barCount: Ember.computed('beatCount', 'timeSignature', function() {
    return this.get('beatCount') / this.get('timeSignature');
  }),

  //
  // Web Audio Nodes
  //
  inputNode: Ember.computed('audioContext', 'fxNode', function() {
    let { audioContext, fxNode } = this.getProperties('audioContext', 'fxNode');
    let mergerNode = WebAudioMergerNode.create({
      audioContext,
      outputNode: fxNode,
    });

    return mergerNode;
  }),

  fxNode: Ember.computed('audioContext', 'outputNode', function() {
    let { audioContext, outputNode } = this.getProperties('audioContext', 'outputNode');
    return FxNode.create({ audioContext, outputNode });
  }),

  nodes: Ember.computed.collect('inputNode', 'fxNode'),
  controls: Ember.computed('nodes.@each.controls', function() {
    return flatten(this.get('nodes').mapBy('controls'));
  }),

  destroyNodes() {
    this.get('nodes').map((node) => { return node.destroy(); });
  },

  destroy() {
    this.get('metronome').destroy();
    this.destroyNodes();
    return this._super.apply(this, arguments);
  },
});
