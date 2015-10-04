import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import Clock from 'linx/lib/clock';
import { ClockEvent } from 'linx/lib/clock';
import { beatToTime, timeToBeat, clamp } from 'linx/lib/utils';

// Holds rhythym based on clock
export default Ember.Object.extend(
  RequireAttributes('audioContext'), {

  // params
  tick: 0,            // computed properties should listen to metronome.tick
  seekBeat: 0,        // last seeked beat of the metronome
  absSeekTime: 0,     // [s] last seeked time of metronome in clock frame of reference
  lastPlayBeat: 0,    // beat at which metronome was last played
  bpm: 128.000,
  isPlaying: false,
  absTickTime: Ember.computed.alias('_clock.tickTime'),
  tickBeat: function() {
    return this.getCurrentBeat();
  }.property('absTickTime'),

  setBpm: function(bpm) {
    // update seekBeat first
    this.seekToBeat(this.getCurrentBeat());
    this.set('bpm', bpm);
  },

  seekToBeat: function(beat) {
    console.log("metronome seekToBeat", beat);
    var prevBeat = this.get('seekBeat');

    // hack to make sure to trigger property changes
    if (beat === prevBeat) {
      beat += 0.00000000001;
    }

    this.setProperties({
      seekBeat: beat,
      absSeekTime: this._getAbsTime()
    });
  },

  playpause: function() {
    var isPlaying = !this.get('isPlaying');

    // synchronously update times
    if (isPlaying) {
      this.setProperties({
        absSeekTime: this._getAbsTime(),
        lastPlayBeat: this.get('seekBeat'),
        isPlaying: isPlaying,
      });
    } else {
      this.setProperties({
        seekBeat: this.getCurrentBeat(),
        isPlaying: isPlaying,
      });
    }
  },

  // Returns current metronome beat
  getCurrentBeat: function() {
    return this.get('seekBeat') + this._getPlayedBeats();
  },

  // Returns metronome's current absolute time
  getCurrentAbsTime: function() {
    return this.get('absSeekTime') + this._getPlayedTime();
  },

  createClipEvent: function(clip) {
    // console.log('createClipEvent', clip);
    return ClipEvent.create({
      clip,
      metronome: this,
      clock: this.get('_clock'),
    });
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

  _getPlayedBeats: function() {
    return timeToBeat(this._getPlayedTime(), this.get('bpm'));
  },

  destroy: function() {
    this.get('clock').destroy();
    this._super.apply(this, arguments);
  },
});

// binds a clip to the metronome
var ClipEvent = Ember.Object.extend(
  RequireAttributes('clip', 'metronome', 'clock'), {

  // params
  startBeat: Ember.computed.reads('clip.startBeat'),
  endBeat: Ember.computed.reads('clip.endBeat'),
  numBeats: Ember.computed.reads('clip.numBeats'),
  bpm: Ember.computed.reads('metronome.bpm'),
  isPlaying: false,
  isFinished: false,
  tick: 0,

  // optional params
  repeatInterval: null,

  clipSeekBeat: function() {
    var seekBeat = this.get('_seekBeat');
    var delayBeats = this.get('_delayBeats');
    var numBeats = this.get('numBeats');

    // factor in delay
    seekBeat += delayBeats;

    return clamp(0, seekBeat, numBeats);
  }.property('_seekBeat', 'numBeats', '_delayBeats'),

  // returns current clipBeat
  getCurrentBeat() {
    let currentClipBeat = this.get('metronome').getCurrentBeat() - this.get('startBeat');
    return clamp(0, currentClipBeat, this.get('numBeats'));
  },

  // internal params
  _delayTime: 0,
  _delayBeats: function() {
    return timeToBeat(this.get('_delayTime'), this.get('bpm'));
  }.property('_delayTime', 'bpm'),

  _startEvent: Ember.computed(function() {
    return ClockEvent.create({
      onExecute: this._executeStart.bind(this),
      clock: this.get('clock'),
    });
  }),

  _tickEvent: Ember.computed(function() {
    return ClockEvent.create({
      onExecute: this._executeTick.bind(this),
      clock: this.get('clock'),
    });
  }),

  _endEvent: Ember.computed(function() {
    return ClockEvent.create({
      onExecute: this._executeEnd.bind(this),
      clock: this.get('clock'),
    });
  }),

  // current metronome seekBeat from clipEvent's frame of reference
  _seekBeat: function() {
    var metronomeSeekBeat = this.get('metronome.seekBeat');
    var startBeat = this.get('startBeat');

    return metronomeSeekBeat - startBeat;
  }.property('metronome.seekBeat', 'startBeat'),

  _schedulingDidChange: function() {
    Ember.run.once(this, '_updateEventTimes');
  }.observes('metronome.isPlaying', 'metronome.absSeekTime', 'startBeat', 'bpm', 'endBeat', 'numBeats').on('init'),

  _updateEventTimes: function() {
    let metronome = this.get('metronome');
    let seekTime = beatToTime(this.get('_seekBeat'), this.get('bpm'));
    let lengthTime = beatToTime(this.get('numBeats'), this.get('bpm'));
    let metronomeIsPlaying = metronome.get('isPlaying');

    // if metronome is paused or jumped back, pause this
    if (!(metronomeIsPlaying && seekTime >= 0)) {
      this.set('isPlaying', false);
    }

    // if seeking before clip end, set isFinished to false
    let currentMetronomeBeat = metronome.getCurrentBeat();
    let isFinished = currentMetronomeBeat >= this.get('endBeat');
    if (!isFinished) {
      this.set('isFinished', false);
    }

    // update events
    let startEvent = this.get('_startEvent');
    let tickEvent = this.get('_tickEvent');
    let endEvent = this.get('_endEvent');
    let absStartTime = metronome.getCurrentAbsTime() - seekTime;
    let absEndTime = absStartTime + lengthTime;

    startEvent.setProperties({
      deadline: absStartTime,
      isScheduled: !isFinished && metronomeIsPlaying,
    });

    tickEvent.setProperties({
      deadline: absStartTime,
      isScheduled: !isFinished && metronomeIsPlaying,
    });

    endEvent.setProperties({
      deadline: absEndTime,
      isScheduled: metronomeIsPlaying
    });
  },

  _executeStart(delay) {
    console.log("_executeStart", this.get('clip.model.title'), delay);
    // TODO(PERFORMANCE): will this miss a few ticks when run loop is behind?
    this.get('_tickEvent').set('repeatInterval', this.get('repeatInterval'));

    this.setProperties({
      _delayTime: delay,
      isPlaying: true,
      isFinished: false,
    });
  },

  _executeTick(delay) {
    // console.log("_executeTick", this.get('clip.model.title'));
    this.incrementProperty('tick');
  },

  _executeEnd(delay) {
    // console.log("_executeEnd", this.get('clip.model.title'), delay);
    this.get('_tickEvent').cancelRepeat();

    this.setProperties({
      isPlaying: false,
      isFinished: true,
    });
  },

  destroy() {
    this.get('_startEvent').destroy();
    this.get('_tickEvent').destroy();
    this.get('_endEvent').destroy();
    this._super.apply(this, arguments);
  }
});
