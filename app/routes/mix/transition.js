import Ember from 'ember';
import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

export default Ember.Route.extend(PreventDirtyTransitionMixin, {
  actions: {
    saveTransition: function() {
      var transition = this.get('controller.transition');

      transition.save();
    },

    deleteTransition: function() {
      var transition = this.get('controller.transition');

      if (window.confirm("Are you sure you want to delete this transition? It cannot be restored once deleted.")) {
        transition.destroyRecord();
        this.transitionTo('mix');
      }
    },
  },

  model: function(params) {
    return this.get('store').find('transition', params.transition_id).then((transition) => {
      return transition;
    }, (reason) => {
      // if transition not found, redirect to mix
      this.replaceWith('mix');
    });
  }
});
