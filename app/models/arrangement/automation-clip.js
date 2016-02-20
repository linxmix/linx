import Ember from 'ember';
import DS from 'ember-data';
import Clip from './clip';

// Clip that controls an automatable of another clip
// TODO(TRANSITION)
export default Clip.extend({
  componentName: 'automation-clip',

  startAutomation: Ember.on('schedule', function() {
    // TODO(TRANSITION)
    // const startTime = this.getAbsoluteStartTime();
    // audioParam.setValueCurveAtTime(this.get('curve').values)
  }),

  stopAutomation: Ember.on('unschedule', function() {
    // TODO(TRANSITION)
    // audioParam.cancelScheduledValues()
  }),
});
