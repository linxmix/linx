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
    console.log('createClipEvent', clip);
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
  tickBeat: null,

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
  }.observes('metronome.isPlaying', 'metronome.absSeekTime', 'startBeat', 'bpm', 'endBeat', 'numBeats', 'repeatInterval').on('init'),

  _updateEventTimes: function() {
    var metronome = this.get('metronome');
    var seekTime = beatToTime(this.get('_seekBeat'), this.get('bpm'));
    var lengthTime = beatToTime(this.get('numBeats'), this.get('bpm'));
    var metronomeIsPlaying = metronome.get('isPlaying');

    // if metronome is paused or jumped back, pause this
    if (!(metronomeIsPlaying && seekTime >= 0)) {
      this.set('isPlaying', false);
    }

    // if seeking before clip end, set isFinished to false
    let currentMetronomeBeat = metronome.getCurrentBeat();
    let endBeat = this.get('endBeat');
    if (currentMetronomeBeat <= endBeat) {
      this.set('isFinished', false);
    }

    // update events
    var startEvent = this.get('_startEvent');
    var endEvent = this.get('_endEvent');
    var absStartTime = metronome.getCurrentAbsTime() - seekTime;
    var absEndTime = absStartTime + lengthTime;

    startEvent.setProperties({
      deadline: absStartTime,
      isScheduled: metronomeIsPlaying,

      // TODO(PERFORMANCE): should this (and possibly others) be handled separately?
      repeatInterval: this.get('repeatInterval'),
    });

    endEvent.setProperties({
      deadline: absEndTime,
      isScheduled: metronomeIsPlaying
    });
  },

  _executeStart: function(delay) {
    // console.log("execute start", this.get('clip.model.title'), this.get('isPlaying'));

    // TODO(AUTOMATIONSPIKE): this will not update when seeking into clip that is already playing
    if (!this.get('isFinished')) {
      this.setProperties({
        _delayTime: delay,
        isPlaying: true,
        isFinished: false,
        tickBeat: 0,
      });
    }

    // TODO(AUTOMATIONSPIKE): move into explicit tick event?
    if (this.get('repeatInterval')) {
      this._executeTick(delay);
    }
  },

  _getCurrentBeat() {
    let currentClipBeat = this.get('metronome').getCurrentBeat() - this.get('startBeat');
    console.log("_getCurrentBeat", currentClipBeat);
    return currentClipBeat;

    // TODO(AUTOMATIONSPIKE): account for delay at automationclip level by passing clipEvent and exposing getCurrentBeat, tick?
    // TODO(AUTOMATIONSPIKE): tickBeat: observes 'tick', 'seekBeat' => return clipEvent.getCurrentBeat

    // let beatWithoutDelay = this.get('metronome').getCurrentBeat() - this.get('startBeat');
    // let delayBeats = timeToBeat(delay, this.get('bpm'));
    // console.log("_getCurrentBeat", beatWithoutDelay, delayBeats);
    // return beatWithoutDelay + delayBeats;
  },

  _executeTick: function(delay) {
    // console.log("execute tick", this.get('clip.model.title'), this.get('isFinished'));
    this.set('tickBeat', this._getCurrentBeat());
  },

  _executeEnd: function(delay) {
    // console.log("execute end", this.get('clip.model.title'));
    this.get('_startEvent').cancelRepeat();
    this.setProperties({
      isPlaying: false,
      isFinished: true,
      tickBeat: this.get('numBeat'),
    });
  },

  destroy: function() {
    this.get('_startEvent').destroy();
    this.get('_endEvent').destroy();
    this._super.apply(this, arguments);
  }
});
