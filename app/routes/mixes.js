import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    createMix: function() {
      var store = this.get('store');
      var mix = store.createRecord('mix', {
        title: 'Mix ' + Ember.uuid(),
      });

      mix.save().then(() => {
        this.transitionTo('mix', mix);
      });
    }
  },

  model: function() {
    return this.get('store').find('mix');
  }
});
