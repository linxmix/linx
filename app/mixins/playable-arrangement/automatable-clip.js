import Ember from 'ember';

import PlayableClipMixin from './clip';

// Interface for automatable arrangement clips
// 'automations': array of Automations
// 'controls': array of Controls
export default Ember.Mixin.create(PlayableClipMixin, {

  // required params
  controls: Ember.computed(() => []),
  automations: Ember.computed(() => []),

  updateAutomations: Ember.observer('automations.@each.{controlType,startBeat,values}', function() {
    const metronome = this.get('metronome');
    const allAutomations = this.get('automations');
    const controls = this.get('controls');

    // schedule automations for each control
    controls.forEach((control) => {
      const automations = allAutomations.filterBy('controlType', control.get('type'))

      automations.forEach((automation) => {
        const values = automation.get('values');

        if (values) {
          const automationStartBeat = automation.get('startBeat');
          const automationStartTime = this.getAbsoluteStartTime(automationStartBeat);
          const automationDuration = metronome.getClipDuration(automationStartBeat, automation.get('beatCount'));

          console.log('scheduleAutomation', control.get('type'), automation.get('values'), automationStartBeat, automationDuration);
          control.setValueCurveAtTime(values, automationStartBeat, automationDuration);
        }
      });
    });
  }).on('schedule'),

  cancelAutomations: Ember.on('unschedule', function() {
    this.get('controls').invoke('cancelAutomations');
  }),

  toString() {
    return '<linx@mixin:playable-arrangement/automatable-clip>';
  },
});
