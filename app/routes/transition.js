import Ember from 'ember';
import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

export default Ember.Route.extend(PreventDirtyTransitionMixin, {
  actions: {
    saveTransition() {
      let transition = this.get('controller.model');
      transition.save();
    },

    deleteTransition() {
      let transition = this.get('controller.model');

      if (window.confirm("Are you sure you want to delete this transition? It cannot be restored once deleted.")) {
        // clean up relationships on parent very manually
        // TODO: fix when issue is resolved
        // http://stackoverflow.com/questions/24644902/deleterecord-with-multiple-belongsto-relationships-in-ember-cli
        // var mix = this.modelFor('mix');
        // mix.removeTransition(transition);

        transition.destroyRecord().then(() => {
          this.transitionTo('transitions');
        });
      }
    },
  },

  model: function(params) {
    return this.get('store').find('transition', params.id).catch((reason) => {
      // if transition not found, redirect to transitions
      this.replaceWith('transitions');
    });
  }
});
