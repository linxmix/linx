import Ember from 'ember';

export default Ember.Controller.extend({

  // expected from route
  mix: null,

  actions: {
    destroyMix() {
      const mix = this.get('mix');

      if (window.confirm("Are you sure you want to delete this mix? It cannot be restored once deleted.")) {
        mix.destroyRecord();
        this.transitionToRoute('mixes');
      }
    },

    selectTransition(transition) {
      const prevId = this.get('transitionId');
      const newId = (transition && transition.get('id')) || '';

      if (prevId === newId) {
        this.set('transitionId', '');
      } else {
        this.set('transitionId', newId);
      }
    }
  },

  // params
  // queryParams: ['transitionId'],
  transitionId: '',

  selectedTransition: Ember.computed('transitionId', 'mix.transitions.@each.id', function() {
    return this.get('mix.transitions')
      .filter((transition) => !!transition)
      .findBy('id', this.get('transitionId'));
  }),
});
