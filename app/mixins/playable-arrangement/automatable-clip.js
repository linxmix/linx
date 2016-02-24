import Ember from 'ember';

import PlayableClipMixin from './clip';

// Interface for automatable arrangement clips
// 'automations': array of Automations
// 'controls': array of Controls
export default Ember.Mixin.create(PlayableClipMixin, {

  // required params
  controls: Ember.computed(() => []),
  automations: Ember.computed(() => []),

  supportedControlTypes: Ember.computed.mapBy('controls', 'type'),

  // TODO(PERFORMANCE): can we do better than canceling and updating all every time?

  automationsDidChange: Ember.observer('automations.@each.{controlType,startBeat,values}', function() {
    Ember.run.once(this, 'updateAutomations');
  }).on('schedule'),

  updateAutomations() {
    this.cancelAutomations();

    if (this.get('isScheduled')) {
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
            const automationDuration = metronome.getDuration(automationStartBeat, automation.get('beatCount'));

            console.log('scheduleAutomation', control.get('type'), automationStartTime, automationStartBeat, automationDuration);
            control.setValueCurveAtTime(values, automationStartTime, automationDuration);
          }
        });
      });
    }
  },

  cancelAutomations: Ember.on('unschedule', function() {
    this.get('controls').invoke('cancelAutomations');
  }),

  toString() {
    return '<linx@mixin:playable-arrangement/automatable-clip>';
  },
});
