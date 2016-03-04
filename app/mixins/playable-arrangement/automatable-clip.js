import Ember from 'ember';

import PlayableClipMixin from './clip';

// Interface for automatable arrangement clips
// 'automationClips': array of AutomationClips
// 'controls': array of Controls
export default Ember.Mixin.create(PlayableClipMixin, {

  // required params
  controls: Ember.computed(() => []),
  automationClips: Ember.computed(() => []),

  supportedControlTypes: Ember.computed.mapBy('controls', 'type'),

  // TODO(PERFORMANCE): can we do better than canceling and updating all every time?
  automationClipsDidChange: Ember.observer('automationClips.@each.{controlType,startBeat,values}', function() {
    Ember.run.once(this, 'updateAutomations');
  }).on('schedule'),

  updateAutomations() {
    this.cancelAutomations();

    if (this.get('isScheduled')) {
      const metronome = this.get('metronome');
      const automationClips = this.get('automationClips');
      const controls = this.get('controls');

      // schedule automationClips for each control
      controls.forEach((control) => {
        (automationClips || [])
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
