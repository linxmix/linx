import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderPrecisionControlsTrack'],

  // required params
  clip: null,

  // params
  track: Ember.computed.reads('clip.track'),

  actions: {
    analyzeTrack() {
      const analyzeTask = this.get('track.analyzeTask');
      analyzeTask.perform();
    }
  }
});

