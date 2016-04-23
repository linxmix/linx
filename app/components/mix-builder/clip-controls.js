import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderClipControls', 'inverted ui segment'],

  // required params
  clip: null,

  // params
  transition: Ember.computed.reads('clip.transition'),
  track: Ember.computed.reads('clip.track'),

  isTransitionClip: Ember.computed.reads('clip.transition'),
  isTrackClip: Ember.computed.reads('clip.track'),
});

