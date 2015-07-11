import Ember from 'ember';
import WaaClock from 'npm:waaclock';
import RequireAttributes from 'linx/lib/require-attributes';

const TICK_INTERVAL = 0.2; // [s] Time between clock ticks

// Wraps WaaClock to provide computed properties
export default Ember.Object.extend(
  RequireAttributes('audioContext'), {

  // params
  tickTime: 0,
  isStarted: false,
  start: function() {
    if (!this.get('isStarted')) {
      this.get('_clock').start();
      this.set('isStarted', true);
    }
  },

  stop: function() {
    if (this.get('isStarted')) {
      this.get('_clock').stop();
      this.set('isStarted', false);
    }
  },

  getCurrentTime: function() {
    return this.get('audioContext').currentTime;
  },

  callbackAtTime: function(cb, time) {
    return this.get('_clock').callbackAtTime(cb, time);
  },

  // internal params
  _clock: Ember.computed(function() { return new WaaClock(this.get('audioContext')); }),
  _tickEvent: null,
  _setupTickEvent: function() {
    this._removeTickEvent();

    if (this.get('isStarted') && false) {
      this.set('_tickEvent', ClockEvent.create({
        onExecute: () => { Ember.run(this, '_tick'); },
        onExpired: () => { console.log("TICK EXPIRED"); },
        deadline: this.getCurrentTime(),
        repeatInterval: TICK_INTERVAL,
        clock: this,
        isScheduled: true,
      }));
    }
  }.observes('isStarted').on('init'),

  _removeTickEvent: function() {
    var tickEvent = this.get('_tickEvent');
    if (tickEvent) { tickEvent.destroy(); }
  },

  _tick: function() {
    this.set('tickTime', this.getCurrentTime());
  },

  destroy: function() {
    this.get('_clock').stop();
    this._removeTickEvent();
    this._super.apply(this, arguments);
  }
});

// Wraps Waaclock event
export const ClockEvent = Ember.Object.extend(
  RequireAttributes('clock'), {

  // params
  onExpired: null,
  onExecute: null,
  repeatInterval: null,
  deadline: null,
  isScheduled: false,
  isRepeatingEvent: function() {
    var repeatInterval = this.get('repeatInterval');
    return (Ember.typeOf(repeatInterval) === 'number') && (repeatInterval > 0);
  }.property('repeatInterval'),

  getCurrentTime: function() {
    return this.get('clock').getCurrentTime();
  },

  // Returns difference between given time and currentTime
  getDelay: function(time) {
    return this.getCurrentTime() - time;
  },

  clear: function() {
    var event = this.get('_event');
    event && event.clear();
    this.set('isScheduled', false);
    return this;
  },

  timeStretch: function(ratio) {
    var event = this.get('_event');
    event && event.timeStretch(this.getCurrentTime(), ratio);
    return this;
  },

  cancelRepeat: function() {
    return this.set('repeatInterval', null);
  },

  // internal params
  _event: null,
  _schedulingDidChange: function() {
    Ember.run.once(this, '_schedule');
  }.observes('clock', 'deadline', 'isScheduled', 'repeatInterval').on('init'),

  _schedule: function() {
    var prevEvent = this.get('_event');
    prevEvent && prevEvent.clear();

    var deadline = this.get('deadline');
    var isRepeatingEvent = this.get('isRepeatingEvent');
    if (this.get('isScheduled') && (Ember.typeOf(deadline) === 'number')) {

      // if we are a non-repeating event past deadline, execute now
      if (!isRepeatingEvent && (deadline <= this.getCurrentTime())) {
        Ember.run(this, '_execute', this.getCurrentTime());
      }

      // otherwise, schedule execution
      else {
        console.log("evnet schedule", deadline);

        var event = this.get('clock').callbackAtTime(() => {
          Ember.run(this, '_execute', deadline);
        }, deadline);

        if (isRepeatingEvent) {
          event.repeat(this.get('repeatInterval'));
        }

        this.set('_event', event);
      }
    }
  },

  _execute: function(executionTime) {
    var onExecute = this.get('onExecute');
    onExecute && onExecute(this.getDelay(executionTime));
  },

  _setupExpiredHandler: function() {
    var event = this.get('_event');
    var onExpired = this.get('onExpired');
    if (event && onExpired) {
      event.onExpired = onExpired;
    } else if (event) {
      event.onExpired = null;
    }
  }.observes('_event', 'onExpired').on('init'),

  destroy: function() {
    this.clear();
    this._super.apply(this, arguments);
  },
});
