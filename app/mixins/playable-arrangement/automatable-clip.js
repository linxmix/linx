import Ember from 'ember';

// Interface for automatable arrangement clips
// 'controls': array of Controls
export default Ember.Mixin.create({

  // required params
  controls: Ember.computed(() => []),

  supportedControlTypes: Ember.computed.mapBy('controls', 'type'),

  toString() {
    return '<linx@mixin:playable-arrangement/automatable-clip>';
  },
});
