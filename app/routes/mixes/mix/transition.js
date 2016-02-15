import Ember from 'ember';
import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

// export default Ember.Route.extend(PreventDirtyTransitionMixin, {
export default Ember.Route.extend({
  actions: {
    saveTransition() {
      const transition = this.get('controller.transition');
      transition.save();
    },

    deleteTransition() {
      const transition = this.get('controller.transition');

      if (window.confirm("Are you sure you want to delete this transition? It cannot be restored once deleted.")) {
        // clean up relationships on parent very manually
        // TODO: fix when issue is resolved
        // http://stackoverflow.com/questions/24644902/deleterecord-with-multiple-belongsto-relationships-in-ember-cli
        // var mix = this.modelFor('mix');
        // mix.removeTransition(transition);

        transition.destroyRecord().then(() => {
          this.sendAction('closeModal');
        });
      }
    },
  },

  setupController(controller, models) {
    return controller.setProperties(models);
  },

  _hideMixArrangementOnActivate: Ember.on('activate', function() {
    this.controllerFor('mixes.mix').set('showArrangement', false);
  }),

  _showMixArrangementOnDeactivate: Ember.on('deactivate', function() {
    this.controllerFor('mixes.mix').set('showArrangement', true);
  }),


  model: function(params) {
    return Ember.RSVP.hash({
      transition: this.get('store').find('transition', params.transition_id).catch((reason) => {
        // if transition not found, redirect to mix
        this.sendAction('closeModal');
      }),
    });
  }
});
