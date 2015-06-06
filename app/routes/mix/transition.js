import Ember from 'ember';
import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

export default Ember.Route.extend(PreventDirtyTransitionMixin, {
  actions: {
    saveTransition: function() {
      var transition = this.modelFor(this.routeName);
      transition.save();
    },

    deleteTransition: function() {
      var transition = this.modelFor(this.routeName);

      if (window.confirm("Are you sure you want to delete this transition? It cannot be restored once deleted.")) {

        // clean up relationships on parent very manually 
        // TODO: fix when issue is resolved
        // http://stackoverflow.com/questions/24644902/deleterecord-with-multiple-belongsto-relationships-in-ember-cli
        var mix = this.modelFor('mix');
        mix.removeTransition(transition);

        transition.destroyRecord().then(() => {
          this.transitionTo('mix');
        });
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
