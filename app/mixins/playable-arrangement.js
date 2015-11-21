import Ember from 'ember';

import Metronome from './playable-arrangement/metronome';
import ReadinessMixin from 'linx/mixins/readiness';
import RequireAttributes from 'linx/lib/require-attributes';

import withDefault from 'linx/lib/computed/with-default';
import equalProps from 'linx/lib/computed/equal-props';

// Interface for playable arrangements of clips
export default Ember.Mixin.create(
  RequireAttributes('clips', 'session'),
  ReadinessMixin('isPlayableArrangementReady'), {

  isPlayableArrangementReady: Ember.computed('readyClips.length', 'validClips.length', function() {
    return this.get('readyClips.length') >= this.get('validClips.length');
  }),

  validClips: Ember.computed.filterBy('clips', 'isValid', true),
  readyClips: Ember.computed.filterBy('clips', 'isReady', true),
  clipSort: ['endBeat:asc', 'startBeat:asc'],
  sortedClips: Ember.computed.sort('clips', 'clipSort'),
  timeSignature: Ember.computed.reads('arrangement.timeSignature'),
  endBeat: Ember.computed.reads('sortedClips.lastObject.endBeat'),
  numBeats: withDefault('endBeat', 0),

  numBars: Ember.computed('numBeats', 'timeSignature', function() {
    return this.get('numBeats') / this.get('timeSignature');
  }),

  audioContext: Ember.computed.reads('session.audioContext'),
  metronome: Ember.computed('audioContext', function() {
    return Metronome.create({ audioContext: this.get('audioContext') });
  }),
});
