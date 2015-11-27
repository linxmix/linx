import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import OrderedHasManyItemMixin from '../models/ordered-has-many/item';
import ReadinessMixin from '../readiness';

import add from 'linx/lib/computed/add';
import subtract from 'linx/lib/computed/subtract';
import { isNumber } from 'linx/lib/utils';

// Interface for playable arrangement clips
// Events: 'schedule', 'unschedule'
// Methods: getCurrentBeat, getCurrentAbsTime
// Properties: seekBeat
export default Ember.Mixin.create({

  // necessary params
  componentName: null, // used to render arrangement-grid clip component
  arrangement: null,

  outputNode: Ember.computed.reads('arrangement.inputNode'),
  metronome: Ember.computed.reads('arrangement.metronome'),
  audioContext: Ember.computed.reads('metronome.audioContext'),

  // returns current beat within this clip's bounds
  getCurrentClipBeat() {
    let currentClipBeat = this.get('metronome').getCurrentBeat() - this.get('startBeat');
    return clamp(0, currentClipBeat, this.get('beatCount'));
  },

  // TODO(REFACTOR): needs to change with metronome beatgrid
  schedulingDidChange: Ember.observer('startBeat', 'beatCount', 'metronome.isPlaying', 'metronome.absSeekTime', 'metronome.bpm', function() {
    Ember.run.once(this, 'triggerSchedulingEvent');
  }),

  triggerSchedulingEvent() {
    if (this.get('metronome.isPlaying')) {
      this.trigger('schedule');
    } else {
      this.trigger('unschedule');
    }
  },

  startBeat: null,
  endBeat: add('startBeat', 'beatCount'),
  beatCount: subtract('endBeat', 'startBeat'),
  halfBeatCount: Ember.computed('beatCount', function() {
    return this.get('beatCount') / 2.0;
  }),
  centerBeat: add('startBeat', 'halfBeatCount'),

  isValidStartBeat: Ember.computed('startBeat', function() {
    let startBeat = this.get('startBeat');
    return isNumber(startBeat);
  }),

  isValidEndBeat: Ember.computed('endBeat', function() {
    let endBeat = this.get('endBeat');
    return isNumber(endBeat);
  }),

  isValidBeatCount: Ember.computed('beatCount', function() {
    let beatCount = this.get('beatCount');
    return isNumber(beatCount) && beatCount > 0;
  }),

  isValid: Ember.computed.and('isValidStartBeat', 'isValidEndBeat', 'isValidBeatCount'),
});
