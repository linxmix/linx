import Ember from 'ember';
import DS from 'ember-data';

import Clip from './clip';

import add from 'linx/lib/computed/add';
import subtract from 'linx/lib/computed/subtract';

const TICKS_PER_BEAT = 10;
const FAKE_CONTROL_POINTS = [
  {
    beat: 0,
    value: 0,
  },
  {
    beat: 4,
    value: 0.5,
  },
  {
    beat: 12,
    value: 0.5,
  },
  {
    beat: 8,
    value: 0.2,
  },
  {
    beat: 16,
    value: 1,
  },
];

// Clip that automates Controls
// Must provide controlType, controlPoints
export default Clip.extend({

  // required params
  target: Ember.computed.reads('targetClip.content'),

  // TODO(POLYMORPHISM)
  targetClip: DS.belongsTo('arrangement/track-clip'),

  controlType: DS.attr('string'), // one of CONTROL_TYPES
  // controlPoints: DS.hasMany('arrangement/automation-clip/control-point', { async: true }),
  controlPoints: Ember.computed(function() {
    return FAKE_CONTROL_POINTS.map((params) => {
      return Ember.Object.create(params);
    });
  }),

  startBeat: Ember.computed.reads('firstControlPoint.beat'),
  endBeat: Ember.computed.reads('lastControlPoint.beat'),

  // TODO(CLEANUP): why is this still bugged?
  // controlPointSort: ['beat:asc'],
  // sortedControlPoints: Ember.computed.sort('controlPoints', 'controlPointSort'),
  sortedControlPoints: Ember.computed('controlPoints.@each.beat', function() {
    return this.get('controlPoints').sortBy('beat');
  }),

  firstControlPoint: Ember.computed.reads('sortedControlPoints.firstObject'),
  lastControlPoint: Ember.computed.reads('sortedControlPoints.lastObject'),

  scale: Ember.computed('sortedControlPoints.@each.{beat,value}', function() {
    return d3.scale.linear()
      // .interpolate('monotone')
      .domain(this.get('sortedControlPoints').mapBy('beat'))
      .range(this.get('sortedControlPoints').mapBy('value'));
  }),

  // TODO(WEBWORKER)
  values: Ember.computed('scale', 'beatCount', function() {
    const { scale, beatCount } = this.getProperties('scale', 'beatCount');
    if (!(scale && beatCount)) { return new Float32Array(0); }

    // populate Float32Array by sampling Curve
    const numTicks = beatCount * TICKS_PER_BEAT;
    const values = new Float32Array(numTicks);
    for (let i = 0; i < numTicks; i++) {
      const beat = (i / numTicks) * beatCount;
      values[i] = scale(beat);
    }

    return values;
  }),

  targetControl: Ember.computed('target.controls.@each.type', 'controlType', function() {
    return (this.get('target.controls') || []).findBy('type', this.get('controlType'));
  }),

  automationDidChange: Ember.observer('targetControl', 'values', function() {
    Ember.run.once(this, 'updateControl');
  }).on('schedule', 'unschedule'),

  updateControl() {
    const { targetControl, values } = this.getProperties('targetControl', 'values');
    if (Ember.isNone(targetControl)) { return; }

    if (this.get('isScheduled')) {
      let startTime = this.getAbsoluteStartTime();
      let duration = this.get('duration');

      // curate args
      if (startTime < 0) {
        duration += startTime;
        startTime = 0;
      }

      if (duration < 0) {
        return;
      }

      // console.log('updateControl', targetControl.get('type'), startTime, duration);
      targetControl.addAutomation(this, {
        values,
        startTime,
        duration,
      });
    } else {
      targetControl.removeAutomation(this);
    }
  },
});
