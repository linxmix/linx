import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderClipControlsTransition'],

  // required params
  clip: null,

  // params
  track: Ember.computed.reads('clip.track'),
});

