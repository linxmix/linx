import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

import add from 'linx/lib/computed/add';
import subtract from 'linx/lib/computed/subtract';
import { isValidNumber, clamp } from 'linx/lib/utils';

// Interface for playable arrangement clips
// Events: schedule, unschedule
// Methods: getCurrentClipBeat
// Properties: audioContext, metronome, outputNode
export default Ember.Mixin.create(Ember.Evented, {

  // required params
  // NOTE: also requires one of endBeat, beatCount
  arrangement: null,
  startBeat: null,

  isDisabled: false,
  isScheduled: false,
  outputNode: Ember.computed.reads('arrangement.inputNode'),
  metronome: Ember.computed.reads('arrangement.metronome'),
  audioContext: Ember.computed.reads('arrangement.audioContext'),
  syncBpm: Ember.computed.reads('metronome.bpm'),

  // returns current beat from metronome's frame of reference
  getCurrentMetronomeBeat() {
    return this.get('metronome').getCurrentBeat();
  },

  // returns current beat from clip's frame of reference
  getCurrentClipBeat() {
    const currentBeat = this.getCurrentMetronomeBeat() - this.get('startBeat');
    return clamp(0, currentBeat, this.get('beatCount'));
  },

  // returns current time from this clip's frame of reference
  getCurrentClipTime() {
    const currentTime = this.getAbsoluteTime() - this.getAbsoluteStartTime();
    return clamp(0, currentTime, this.get('duration'));
  },

  // returns absolute start time of this clip from metronome's frame of reference
  getAbsoluteStartTime() {
    return this.get('metronome').beatToTime(this.get('startBeat'));
  },

  // returns absolute start time of this clip from metronome's frame of reference
  getAbsoluteEndTime() {
    return this.get('metronome').beatToTime(this.get('endBeat'));
  },

  // returns absolute time from metronome's frame of reference
  getAbsoluteTime() {
    return this.get('metronome').getAbsTime();
  },

  // duration of clip in [s]
  // TODO(MULTIGRID)
  duration: Ember.computed('metronome.bpm', 'startBeat', 'beatCount', function() {
    return this.get('metronome').getDuration(this.get('startBeat'), this.get('beatCount'));
  }),

  endBeat: add('startBeat', 'beatCount'),
  beatCount: subtract('endBeat', 'startBeat'),
  halfBeatCount: Ember.computed('beatCount', function() {
    return this.get('beatCount') / 2.0;
  }),
  centerBeat: add('startBeat', 'halfBeatCount'),

  isValidStartBeat: Ember.computed('startBeat', function() {
    const startBeat = this.get('startBeat');
    return isValidNumber(startBeat);
  }),

  isValidEndBeat: Ember.computed('endBeat', function() {
    const endBeat = this.get('endBeat');
    return isValidNumber(endBeat);
  }),

  isValidBeatCount: Ember.computed('beatCount', function() {
    const beatCount = this.get('beatCount');
    return isValidNumber(beatCount) && beatCount > 0;
  }),

  // TODO(REFACTOR): turn isValid into validness mixin?
  isValid: Ember.computed.and('isValidStartBeat', 'isValidEndBeat', 'isValidBeatCount'),

  clipScheduleDidChange: Ember.observer('isValid', 'isDisabled', 'startBeat', 'beatCount', 'duration', 'metronome.{absSeekTime,isPlaying,bpm}', function() {
    this.set('isScheduled', this.get('metronome.isPlaying'));
    Ember.run.once(this, 'triggerScheduleEvents');
  }),

  triggerScheduleEvents() {
    this.trigger('unschedule');

    if (this.get('isScheduled')) {
      this.trigger('schedule');
    }
  },

  // _startEvent: null,
  // _scheduleStartEvent: Ember.on('schedule', function() {
  //   const metronome = this.get('metronome');
  //   const startEvent = metronome && metronome.callbackAtBeat(() => {
  //     this.trigger('start');
  //   }, this.get('startBeat'));
  //   this.set('_startEvent', startEvent);
  // }),

  // _unscheduleStartEvent: Ember.on('unschedule', function() {
  //   const startEvent = this.get('_startEvent');

  //   startEvent && startEvent.clear();
  // }),

  toString() {
    return '<linx@mixin:playable-arrangement/clip>';
  },
});
