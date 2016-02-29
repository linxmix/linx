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
      const automations = this.get('automations');
      const controls = this.get('controls');

      // schedule automations for each control
      controls.forEach((control) => {
        (automations || [])
          .filterBy('controlType', control.get('type'))
          .invoke('scheduleAutomation', control, metronome);
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
