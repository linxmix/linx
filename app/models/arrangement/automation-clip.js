import Ember from 'ember';
import DS from 'ember-data';

import Clip from './clip';

import add from 'linx/lib/computed/add';
import subtract from 'linx/lib/computed/subtract';

const TICKS_PER_BEAT = 10;

// Clip that automates Controls
// Must provide controlType, controlPoints
export default Clip.extend({

  // required params
  target: Ember.computed.reads('targetClip.content'),

  // TODO(POLYMORPHISM)
  targetClip: DS.belongsTo('arrangement/track-clip'),

  controlType: DS.attr('string'), // one of CONTROL_TYPES
  controlPoints: DS.hasMany('arrangement/automation-clip/control-point', { async: true }),

  startBeat: Ember.computed.reads('sortedControlPoints.firstObject.beat'),
  endBeat: Ember.computed.reads('sortedControlPoints.lastObject.beat'),

  // TODO(CLEANUP): why cant i depend on firstControlPoint.beat?
  // firstControlPoint: Ember.computed.reads('sortedControlPoints.firstObject'),
  // lastControlPoint: Ember.computed.reads('sortedControlPoints.lastObject'),

  // TODO(CLEANUP): why is this still bugged?
  // controlPointSort: ['beat:asc'],
  // sortedControlPoints: Ember.computed.sort('controlPoints', 'controlPointSort'),
  sortedControlPoints: Ember.computed('controlPoints.[]', function() {
    return this.get('controlPoints').sortBy('beat');
  }),


  // scale: Ember.computed('sortedControlPoints.@each.{beat,value}', function() {
  scale: Ember.computed('sortedControlPoints.[]', function() {
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

  initBasicFade(beatCount = 0, n = 4) {
    this.destroyControlPoints().then(() => {
      const controlPoints = [];

      for (let i = 0.0; i <= n; i++) {
        console.log('create control point', beatCount * (i / n), i / n)
        this.get('store').createRecord('arrangement/automation-clip/control-point', {
          automationClip: this,
          beat: beatCount * (i / n),
          value: i / n,
        });
      }
    });
  },

  initBasicFadeIn(beatCount, numControlPoints) {
    return this.initBasicFade(beatCount, numControlPoints);
  },

  initBasicFadeOut(beatCount, numControlPoints) {
    return this.initBasicFade(beatCount, numControlPoints);
  },

  destroyControlPoints() {
    return this.get('controlPoints').then((controlPoints) => {
      return Ember.RSVP.all(controlPoints.toArray().invoke('destroyRecord'));
    });
  },
});
