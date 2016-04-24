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
    toggleShowAutomation() {
      console.log('toggleShowAutomation');
      this.attrs.toggleShowAutomation();
    },

    optimizeTransition() {
      const transition = this.get('transition.content') || this.get('transition');
      transition && transition.optimize();
    },
  },

  // params
  transition: Ember.computed.reads('clip.transition'),
});

