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

  createClipEvent: function(item) {
    console.log('createClipEvent', item, item.get('clip.content'))
    return ClipEvent.create({
      arrangementItem: item,
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

// TODO(TRANSITION)
// binds arrangementItem and clip to the metronome
var ArrangementEvent = Ember.Object.extend(
  RequireAttributes('arrangementItem', 'metronome', 'clock'), {

  // params
  clip: Ember.computed.reads('arrangementItem.clip'),
  startBeat: Ember.computed.alias('arrangementItem.startBeat'),
  endBeat: Ember.computed.alias('arrangementItem.endBeat'),
  numBeats: Ember.computed.alias('arrangementItem.numBeats'),
  bpm: Ember.computed.alias('metronome.bpm'),
  isPlaying: false,

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

  // current metronome seekBeat from clipevent's frame of reference
  _seekBeat: function() {
    var metronomeSeekBeat = this.get('metronome.seekBeat');
    var startBeat = this.get('startBeat');

    return metronomeSeekBeat - startBeat;
  }.property('metronome.seekBeat', 'startBeat'),

  _schedulingDidChange: function() {
    Ember.run.once(this, '_updateEventTimes');
  }.observes('metronome.isPlaying', 'metronome.absSeekTime', '_seekBeat', 'bpm').on('init'),

  _updateEventTimes: function() {
    var metronome = this.get('metronome');
    var seekTime = beatToTime(this.get('_seekBeat'), this.get('bpm'));
    var lengthTime = beatToTime(this.get('length'), this.get('bpm'));
    var metronomeIsPlaying = metronome.get('isPlaying');

    // if metronome is paused or jumped back, pause this
    if (!(metronomeIsPlaying && seekTime >= 0)) {
      this.set('isPlaying', false);
    }

    // update events
    var startEvent = this.get('_startEvent');
    var endEvent = this.get('_endEvent');
    var absStartTime = metronome.getCurrentAbsTime() - seekTime;
    var absEndTime = absStartTime + lengthTime;

    startEvent.setProperties({
      deadline: absStartTime,
      isScheduled: metronomeIsPlaying
    });

    endEvent.setProperties({
      deadline: absEndTime,
      isScheduled: metronomeIsPlaying
    });
  },

  _executeStart: function(delay) {
    console.log("execute start", this.get('arrangementItem.clip.track.title'), delay);
    this.setProperties({
      _delayTime: delay,
      isPlaying: true,
    });
  },

  _executeEnd: function(delay) {
    console.log("execute end", this.get('arrangementItem.clip.track.title'));
    this.set('isPlaying', false);
  },

  destroy: function() {
    this._unschedule();
    this._super.apply(this, arguments);
  }
});
