import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import OrderedHasManyItemMixin from '../models/ordered-has-many/item';

import add from 'linx/lib/computed/add';
import subtract from 'linx/lib/computed/subtract';
import { isValidNumber, clamp } from 'linx/lib/utils';

// Interface for playable arrangement clips
// Events: schedule, unschedule
// Methods: getCurrentBeat
// Properties: audioContext, metronome, outputNode
export default Ember.Mixin.create(Ember.Evented, {

  // params
  componentName: null, // used to render arrangement-grid clip component
  arrangement: null,
  startBeat: null,
  isMuted: false,

  outputNode: Ember.computed.reads('arrangement.inputNode'),
  metronome: Ember.computed.reads('arrangement.metronome'),
  audioContext: Ember.computed.reads('metronome.audioContext'),

  // returns current beat from clip's frame of reference
  getCurrentBeat() {
    let currentBeat = this.get('metronome').getCurrentBeat() - this.get('startBeat');
    return clamp(0, currentBeat, this.get('beatCount'));
  },

  endBeat: add('startBeat', 'beatCount'),
  beatCount: subtract('endBeat', 'startBeat'),
  halfBeatCount: Ember.computed('beatCount', function() {
    return this.get('beatCount') / 2.0;
  }),
  centerBeat: add('startBeat', 'halfBeatCount'),

  isValidStartBeat: Ember.computed('startBeat', function() {
    let startBeat = this.get('startBeat');
    return isValidNumber(startBeat);
  }),

  isValidEndBeat: Ember.computed('endBeat', function() {
    let endBeat = this.get('endBeat');
    return isValidNumber(endBeat);
  }),

  isValidBeatCount: Ember.computed('beatCount', function() {
    let beatCount = this.get('beatCount');
    return isValidNumber(beatCount) && beatCount > 0;
  }),

  // TODO(REFACTOR): turn isValid into validness mixin?
  isValid: Ember.computed.and('isValidStartBeat', 'isValidEndBeat', 'isValidBeatCount'),

  clipScheduleDidChange: Ember.observer('isValid', 'isMuted', 'startBeat', 'beatCount', 'metronome.absSeekTime', 'metronome.isPlaying', function() {
    Ember.run.once(this, 'triggerScheduleEvents');
  }),

  triggerScheduleEvents() {
    this.trigger('unschedule');

    if (this.get('metronome.isPlaying')) {
      this.trigger('schedule');
    }
  },
});
