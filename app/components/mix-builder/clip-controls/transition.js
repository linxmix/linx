import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderClipControlsTransition'],

  // required params
  clip: null,

  // params
  transition: Ember.computed.reads('clip.transition'),
});

