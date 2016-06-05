import Ember from 'ember';

import _ from 'npm:underscore';

import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

export default Ember.Route.extend(PreventDirtyTransitionMixin, {

  // implement prevent dirty transition mixin
  modelForDirtyTransition() {
    return this.get('controller.mix');
  },

  actions: {
    openTransitionModal(transition) {
      this.transitionTo('mixes.mix.transition', transition.get('id'));
    },

    closeModal() {
      this.transitionTo('mixes.mix');
    }
  },

  setupController(controller, models) {
    return controller.setProperties(models);
  },

  model: function(params) {
    return this.get('store').find('mix', params.mix_id).then((mix) => {
      return { mix };
    }, (reason) => {
      this.transitionTo('mixes');
    });
  }
});
