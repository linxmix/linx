import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderPrecisionControls', 'inverted ui segment container grid'],

  // required params
  selectedTransition: null,

  // optional params
  showAutomation: false,
  jumpTrackTask: null,
  jumpTrack: Ember.K,
});

