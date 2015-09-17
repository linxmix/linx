import Ember from 'ember';

export default Ember.Controller.extend({
  // expected params
  model: null,

  mix: Ember.computed('model', function() {
    let transition = this.get('model');

    return transition && transition.generateMix();
  }),
});
