import Ember from 'ember';
import DS from 'ember-data';

import Clip from './clip';

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

  // // TODO(POLYMORPHISM)
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
    if (!(scale && beatCount)) return [];

    // populate Float32Array by sampling Curve
    const numTicks = beatCount * TICKS_PER_BEAT;
    const values = new Float32Array(numTicks);
    for (let i = 0; i < numTicks; i++) {
      const beat = (i / numTicks) * beatCount;
      values[i] = scale(beat);
    }

    return values;
  }),

  // NOTE: control has to call scheduleAutomation because only the control can cancel automations.
  //       this is important because automations need to reschedule on update
  scheduleAutomation(control, metronome) {
    Ember.assert('Cannot scheduleAutomation without a control', Ember.isPresent(control));
    const values = this.get('values');

    if (values) {
      const startTime = this.getAbsoluteStartTime();
      const duration = this.get('duration');

      console.log('scheduleAutomation', control.get('type'), startTime, duration);
      control.setValueCurveAtTime(values, startTime, duration);
    }
  },
});
