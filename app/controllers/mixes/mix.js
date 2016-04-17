import Ember from 'ember';

export default Ember.Controller.extend({

  // expected from route
  mix: null,

  actions: {
    selectTransition(transition) {
      this.set('transitionId', transition && transition.get('id') || '');
    }
  },

  // params
  queryParams: ['transitionId'],
  transitionId: '',

  selectedTransition: Ember.computed('transitionId', 'mix.transitions.@each.id', function() {
    return this.get('mix.transitions')
      .filter((transition) => !!transition)
      .findBy('id', this.get('transitionId'));
  }),
});
