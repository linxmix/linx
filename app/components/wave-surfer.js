import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['wave-surfer'],

  initWave: function() {
    var wave = this.get('wave');

    var params = {
      container: this.$('.wave'),
    };

    wave.drawWave(Ember.merge(this.get('defaultParams'), params, this.get('params')));
  }.on('didInsertElement'),

  // params
  wave: null,
  defaultParams: {
    audioContext: App.audioContext,
    waveColor: 'violet',
    progressColor: 'purple',
    cursorColor: 'white',
    minPxPerSec: 20,
    normalize: true,
    height: 128,
    fillParent: true,
    scrollParent: false,
    cursorWidth: 2,
    renderer: 'Canvas',
  },

  // expected params
  params: null,
});
