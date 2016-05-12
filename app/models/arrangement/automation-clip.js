import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';
import d3 from 'd3';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';
import Clip from './clip';

import add from 'linx/lib/computed/add';
import subtract from 'linx/lib/computed/subtract';

const TICKS_PER_BEAT = 100;

// Clip that automates Controls
// Must provide controlType, controlPoints
export default Clip.extend(
  OrderedHasManyMixin('_controlPoints'), {

  addControlPoints(paramsArray = []) {
    // Ember.Logger.log('addControlPoints', paramsArray);
    const controlPoints = paramsArray.map((params) => {
      return this.createItem(_.defaults({
        automationClip: this,
      }, params));
    });
  },

  // implement ordered has many
  orderedHasManyItemModelName: 'arrangement/automation-clip/control-point',
  _controlPoints: DS.hasMany('arrangement/automation-clip/control-point', { async: true }),
  controlPoints: Ember.computed.reads('items.content'),

  // TODO(POLYMORPHISM)
  target: Ember.computed.reads('targetClip.content'),
  targetClip: DS.belongsTo('arrangement/track-clip'),
  controlType: DS.attr('string'), // one of CONTROL_TYPES

  startBeat: Ember.computed.reads('controlPoints.firstObject.beat'),
  endBeat: Ember.computed.reads('controlPoints.lastObject.beat'),

  startValue: Ember.computed.reads('controlPoints.firstObject.value'),
  endValue: Ember.computed.reads('controlPoints.lastObject.value'),

  // TODO(CLEANUP): why cant i depend on firstControlPoint.beat?
  // firstControlPoint: Ember.computed.reads('controlPoints.firstObject'),
  // lastControlPoint: Ember.computed.reads('controlPoints.lastObject'),

  scale: Ember.computed('controlPoints.@each.{beat,value}', function() {
    return d3.scale.linear()
      // .interpolate('monotone')
      .domain(this.get('controlPoints').mapBy('beat'))
      .range(this.get('controlPoints').mapBy('value'));
  }),

  // TODO(WEBWORKER)
  values: Ember.computed('scale', 'beatCount', 'startValue', 'endValue', function() {
    const { scale, beatCount, startValue, endValue } = this.getProperties('scale', 'beatCount', 'startValue', 'endValue');
    if (!(scale && (beatCount > 0))) { return new Float32Array(0); }

    // populate Float32Array by sampling Curve
    const numTicks = beatCount * TICKS_PER_BEAT;
    const values = new Float32Array(numTicks);
    for (let i = 0; i < numTicks; i++) {

      // for first value, use startValue
      let value;
      if (i === 0) {
        value = startValue;

      // for last value, get last point's value
      } else if (i === numTicks - 1) {
        value = endValue;

      // otherwise, get value indicated by scale
      } else {
        const beat = (i / numTicks) * beatCount;
        value = scale(beat);
      }

      values[i] = value;
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
    let { targetControl, values } = this.getProperties('targetControl', 'values');
    if (Ember.isNone(targetControl)) { return; }

    if (this.get('isScheduled')) {
      let startTime = this.getAbsoluteStartTime();
      let duration = this.get('duration');

      if (startTime < 0) {
        duration += startTime;
        startTime = 0;
      }

      if (duration < 0) {
        return;
      }

      // TODO(TECHDEBT: think of this edge case
      const fullDuration = this.get('duration');
      if (fullDuration !== duration) {
        console.log('fullDuration !== duration', this.get('targetClip.track.title'), fullDuration, duration);
        const ratio = duration / fullDuration;
        const index = ~~(ratio * values.length);

        values = values.slice(index, values.length);
      }

      // Ember.Logger.log('updateControl', targetControl.get('type'), startTime, duration);
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
