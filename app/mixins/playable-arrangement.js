import Ember from 'ember';

import d3 from 'd3';

import withDefault from 'linx/lib/computed/with-default';
import Metronome from './playable-arrangement/metronome';
import WebAudioMergerNode from 'linx/lib/web-audio/merger-node';
import computedObject from 'linx/lib/computed/object';
import BeatGrid from './playable-arrangement/beat-grid';
import { flatten, isValidNumber } from 'linx/lib/utils';
import GainNode from 'linx/lib/web-audio/gain-node';

// Interface for playable arrangements of clips
export default Ember.Mixin.create({
  // ReadinessMixin('isPlayableArrangementReady'), {

  // required params
  clips: null,
  bpmControlPoints: null, // or bpmScale
  audioContext: null,

  // optional params
  outputNode: Ember.computed.reads('audioContext.destination'),
  timeSignature: 4,

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
    this.get('metronome').stop();
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

  isPlaying: Ember.computed.reads('metronome.isPlaying'),
  duration: Ember.computed.reads('beatGrid.duration'),

  metronome: computedObject(Metronome, {
    'audioContext': 'audioContext',
    'beatGrid': 'beatGrid',
  }),

  bpmScale: Ember.computed('bpmControlPoints.@each.{beat,value}', 'beatCount', function() {
    const beatCount = this.get('beatCount');
    const bpmControlPoints = this.get('bpmControlPoints') || [];

    const bpmControlBeats = bpmControlPoints.mapBy('beat');
    const bpmControlValues = bpmControlPoints.mapBy('value');

    const firstBpmValue = bpmControlValues.get('firstObject');
    const lastBpmValue = bpmControlValues.get('lastObject');

    return d3.scale.linear()
      .domain([0].concat(bpmControlBeats).concat([beatCount]))
      .range([firstBpmValue].concat(bpmControlValues).concat([lastBpmValue]))
      .clamp(true);
  }),

  beatGrid: Ember.computed('bpmScale', 'beatCount', 'timeSignature', function() {
    return BeatGrid.create(this.getProperties('bpmScale', 'beatCount', 'timeSignature'));
  }),

  // TODO(REFACTOR): arrangement shouldn't have to wait on clips? clips will just update when loaded
  isPlayableArrangementReady: true,
  // isPlayableArrangementReady: Ember.computed('readyClips.length', 'validClips.length', function() {
  //   return this.get('readyClips.length') >= this.get('validClips.length');
  // }),

  validClips: Ember.computed.filterBy('clips', 'isValid', true),
  readyClips: Ember.computed.filterBy('clips', 'isReady', true),

  // TODO(TECHDEBT): have to async update sortedClips in next runloop,
  // weird bug with computed properties not updating correctly otherwise
  // clipSort: ['endBeat:asc', 'startBeat:asc'],
  // sortedClips: Ember.computed.sort('clips', 'clipSort'),
  // sortedClips: Ember.computed('clips.@each.endBeat', function() {
  //   return this.get('clips').sortBy('endBeat');
  // }),
  _updateSortedClips: Ember.observer('clips.@each.endBeat', function() {
    Ember.RSVP.all(this.get('clips')).then((clips) => {
      Ember.run.next(() => {
        this.set('sortedClips', this.get('clips')
          .reject((clip) => !clip)
          .sortBy('endBeat')
        );
      });
    });
  }).on('init'),
  sortedClips: Ember.computed(() => []),

  endBeat: Ember.computed.reads('sortedClips.lastObject.endBeat'),
  beatCount: withDefault('endBeat', 0),

  barCount: Ember.computed('beatCount', 'timeSignature', function() {
    return this.get('beatCount') / this.get('timeSignature');
  }),

  getRemainingDuration() {
    const beatGrid = this.get('beatGrid');
    const beatCount = this.get('beatCount');
    const currentBeat = this.getCurrentBeat();
    return beatGrid.getDuration(currentBeat, beatCount - currentBeat);
  },

  getCurrentBeat() {
    return this.get('metronome').getCurrentBeat();
  },

  //
  // Web Audio Nodes
  //
  inputNode: computedObject(WebAudioMergerNode, {
    'audioContext': 'audioContext',
    'outputNode': 'gainNode.content',
  }),

  gainNode: computedObject(GainNode, {
    'value': 1.3,
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

  toString() {
    return '<linx@mixin:playable-arrangement>';
  }
});
