import Ember from 'ember';

const TICKS_PER_BEAT = 10;

// Interface for Automations which manipulate Controls
// Must provide curve, controlType, controlPoints
export default Ember.Mixin.create({

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

    return values;
  }),

  // NOTE: control has to call scheduleAutomation because only the control can cancel automations.
  //       this is important because automations need to reschedule on update
  scheduleAutomation(control, metronome) {
    Ember.assert('Cannot scheduleAutomation without a control', Ember.isPresent(control));
    const values = this.get('values');

    if (values) {
      const startBeat = this.get('startBeat');
      const startTime = this.getAbsoluteStartTime(startBeat);
      // TODO(REFACTOR): turn this into this.getClipDuration
      const duration = metronome.getDuration(startBeat, this.get('beatCount'));

      console.log('scheduleAutomation', control.get('type'), startTime, startBeat, duration);
      control.setValueCurveAtTime(values, startTime, duration);
    }
  },
});
