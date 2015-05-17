import Ember from 'ember';
import Wave from '/lib/wave';

export default Ember.Component.extend({
  classNames: ['clip clip-wave'],

  initWave: function() {
    console.log('init clip wave');
    var wave = Wave.create();
    this.set('wave', wave);
  }.on('init'),

  // params
  wave: null,
  waveParams: null,

  // expected params
  clip: null,
});
