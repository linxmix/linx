import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';

export default Ember.Component.extend(
  BubbleActions('toggleShowAutomation'), {

  classNames: ['MixBuilderPrecisionControlsTransition'],

  // required params
  clip: null,

  // optional params
  showAutomation: true,

  actions: {
    optimizeTransition() {
      const transition = this.get('transition.content') || this.get('transition');
      transition && transition.optimize({
        startVolume: this.get('optimizeStartVolume'),
        volumeControlPointCount: this.get('optimizeControlPointCount'),
      });
    },
  },

  // TODO(TECHDEBT): share these with other defaults, ie models/transition
  optimizeControlPointCount: 5,
  optimizeStartVolume: 0.7,

  // params
  transition: Ember.computed.reads('clip.transition'),
});

