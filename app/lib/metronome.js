import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import Clock from 'linx/lib/clock';
import { ClockEvent } from 'linx/lib/clock';
import { beatToTime, timeToBeat } from 'linx/lib/utils';

// Holds rhythym based on clock
export default Ember.Object.extend(
  RequireAttributes('audioContext'), {

  // params
  tick: 0, // computed properties should listen to metronome.tick
  seekTime: 0, // [s] last seeked time of the metronome
  absSeekTime: 0, // time of metronome in clock frame of reference
  lastPlayTime: 0, // [s] last time metronome was played
  isPlaying: false,
  bpm: 128.000, // set by tempo automation
  absSeekTime: 0,
  absTickTime: Ember.computed.alias('_clock.tickTime'),
  tickTime: function() {
    return this.getCurrentTime();
  }.property('absTickTime'),
  tickBeat: function() {
    return beatToTime(this.get('tickTime'), this.get('bpm'));
  }.property('tickTime'),

  playpause: function() {
    var isPlaying = !this.get('isPlaying');

    // synchronously update times
    if (isPlaying) {
      this.setProperties({
        absSeekTime: this._getAbsTime(),
        lastPlayTime: this.get('seekTime'),
        isPlaying: isPlaying,
      });
    } else {
      this.setProperties({
        seekTime: this.getCurrentTime(),
        isPlaying: isPlaying,
      });
    }
  },

  // Returns current metronome time
  getCurrentTime: function() {
    return this.get('seekTime') + this._getPlayedTime();
  },

  // Returns absolute current metronome time
  getCurrentAbsTime: function() {
    return this.get('absSeekTime') + this._getPlayedTime();
  },

  // Returns difference between given time and currentTime
  getDelay: function(time) {
    return this.getCurrentTime() - time;
  },

  createClipEvent: function(clip) {
    return ClipEvent.create({
      arrangementClip: clip,
      metronome: this,
      clock: this.get('_clock'),
    });
  },

  seekToTime: function(time) {
    this.setProperties({
      seekTime: time,
      absSeekTime: this._getAbsTime()
    });
  },

  getCurrentBeat: function() {
    return timeToBeat(this.getCurrentTime(), this.get('bpm'));
  },

  seekToBeat: function(beat) {
    this.seekToTime(beatToTime(beat, this.get('bpm')));
  },

  // internal params
  _clock: Ember.computed(function() {
    var clock = Clock.create({ audioContext: this.get('audioContext') });
    clock.start();
    return clock;
  }),

  _getAbsTime: function() {
    return this.get('_clock').getCurrentTime();
  },

  _getPlayedTime: function() {
    if (this.get('isPlaying')) {
      return this._getAbsTime() - this.get('absSeekTime');
    } else {
      return 0;
    }
  },

  destroy: function() {
    this.get('clock').destroy();
    this._super.apply(this, arguments);
  },
});

// binds an arrangementClip to the metronome as a ClipEvent
var ClipEvent = Ember.Object.extend(
  RequireAttributes('arrangementClip', 'metronome', 'clock'), {

  // params
  startBeat: Ember.computed.alias('arrangementClip.startBeat'),
  endBeat: Ember.computed.alias('arrangementClip.endBeat'),
  length: Ember.computed.alias('arrangementClip.length'),
  bpm: Ember.computed.alias('metronome.bpm'),
  isPlaying: false,

  startTime: function() {
    return beatToTime(this.get('startBeat'), this.get('bpm'));
  }.property('startBeat', 'bpm'),

  endTime: function() {
    return beatToTime(this.get('endBeat'), this.get('bpm'));
  }.property('endBeat', 'bpm'),

  lengthTime: function() {
    return this.get('endTime') - this.get('startTime');
  }.property('startTime', 'endTime'),

  clipSeekTime: function() {
    var seekTime = this.get('_seekTime');
    var delay = this.get('_delay');
    var lengthTime = this.get('lengthTime');

    // factor in delay
    seekTime += delay;

    // clamp seekTime
    if (seekTime < 0) {
      return 0;
    } else if (seekTime > lengthTime) {
      return lengthTime;
    } else {
      return seekTime;
    }
  }.property('_seekTime', 'lengthTime', '_delay'),

  // internal params
  _delay: 0,

  _startEvent: Ember.computed(function() {
    return ClockEvent.create({
      onExecute: this._executeStart.bind(this),
      clock: this.get('clock'),
    });
  }),

  _endEvent: Ember.computed(function() {
    return ClockEvent.create({
      onExecute: this._executeEnd.bind(this),
      clock: this.get('clock'),
    });
  }),

  _seekTime: function() {
    var metronomeSeekTime = this.get('metronome.seekTime');
    var startTime = this.get('startTime');

    return metronomeSeekTime - startTime;
  }.property('metronome.seekTime', 'startTime'),

  _schedulingDidChange: function() {
    Ember.run.once(this, '_updateEventTimes');
  }.observes('metronome.isPlaying', 'metronome.absSeekTime', '_seekTime').on('init'),

  _updateEventTimes: function() {
    var metronome = this.get('metronome');
    var metronomeIsPlaying = metronome.get('isPlaying');

    // if metronome is paused, pause this
    if (!metronomeIsPlaying) {
      this.set('isPlaying', false);
    }

    // update events
    var startEvent = this.get('_startEvent');
    var endEvent = this.get('_endEvent');
    var seekTime = this.get('_seekTime');
    var absStartTime = metronome.getCurrentAbsTime() - seekTime;

    startEvent.setProperties({
      deadline: absStartTime,
      isScheduled: metronomeIsPlaying
    });

    endEvent.setProperties({
      deadline: absStartTime + this.get('lengthTime'),
      isScheduled: metronomeIsPlaying
    });
  },

  _executeStart: function(delay) {
    console.log("execute start", this.get('arrangementClip.clip.track.title'))
    this.setProperties({
      _delay: delay,
      isPlaying: true,
    });
  },

  _executeEnd: function(delay) {
    console.log("execute end", this.get('arrangementClip.clip.track.title'))
    this.set('isPlaying', false);
  },

  destroy: function() {
    this._unschedule();
    this._super.apply(this, arguments);
  }
});
