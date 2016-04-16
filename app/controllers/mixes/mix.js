import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    selectTransition(transition) {
      this.set('transitionId', transition && transition.get('id') || '');
    }
  },

  // expected from route
  mix: null,

  queryParams: ['transitionId'],
  transitionId: '',

  selectedTransition: Ember.computed('transitionId', 'mix.transitions.@each.id', function() {
    return this.get('mix.transitions').findBy('id', this.get('transitionId'));
  }),
});
