import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    createMix() {
      var store = this.get('store');
      var mix = store.createRecord('mix', {
        title: 'Mix ' + Ember.uuid(),
      });

      this.transitionTo('mix', mix);
    },

    selectMix(mix) {
      this.transitionTo('mix', mix);
    }
  },

  setupController(controller, models) {
    controller.setProperties(models);
  },

  model: function() {
    return Ember.RSVP.hash({
      mixes: this.get('store').findAll('mix'),
    });
  }
});
