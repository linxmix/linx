import Ember from 'ember';

const TICKS_PER_BEAT = 10;

// Interface for Automations which manipulate Controls
// Must provide curve, controlType, controlPoints
export const Automation = Ember.Mixin.create({

  // required params
  startBeat: 0,
  beatCount: 0, // length of curve, in beats
  controlType: '', // one of CONTROL_TYPES
  curve: null, // implements CurveMixin, units of beats

  // TODO(WEBWORKER)
  values: Ember.computed('curve', 'beatCount', function() {
    const { curve, beatCount } = this.getProperties('curve', 'beatCount');
    if (!(curve && beatCount)) return [];

    // populate Float32Array by sampling Curve
    const numTicks = beatCount * TICKS_PER_BEAT;
    const values = new Float32Array(numTicks);
    for (let i = 0; i < numTicks; i++) {
      const beat = (i / numTicks) * beatCount;
      values[i] = curve.getPoint(beat);
    }

    console.log('automation.values', beatCount, values);
    return values;
  }),
});
