import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderPrecisionControls', 'inverted ui segment container grid'],

  // required params
  selectedTransition: null,
  selectedAutomation: null,

  // optional params
  jumpTrackTask: null,
  jumpTrack: Ember.K,
  quantizeBeat: Ember.K,
  selectAutomation: Ember.K,
});

