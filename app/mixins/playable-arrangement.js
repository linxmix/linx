import Ember from 'ember';

import Metronome from './playable-arrangement/metronome';
import ReadinessMixin from 'linx/mixins/readiness';
import RequireAttributes from 'linx/lib/require-attributes';
import { beatToTime, timeToBeat, clamp, isNumber } from 'linx/lib/utils';
import withDefault from 'linx/lib/computed/with-default';
import equalProps from 'linx/lib/computed/equal-props';
import { default as Clock, ClockEvent } from 'linx/lib/clock';

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
  beatCount: withDefault('endBeat', 0),

  barCount: Ember.computed('beatCount', 'timeSignature', function() {
    return this.get('beatCount') / this.get('timeSignature');
  }),

  audioContext: Ember.computed.reads('session.audioContext'),
  clock: Ember.computed('audioContext', function() {
    let clock = Clock.create({ audioContext: this.get('audioContext') });
    clock.start();
    return clock;
  }),

  // TODO(REFACTOR): does metronome belong here, or on arrangement-player?
  metronome: Ember.computed('clock', function() {
    return Metronome.create({ clock: this.get('clock') });
  }),
});
