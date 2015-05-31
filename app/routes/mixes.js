import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    createMix: function() {
      var mix = this.get('store').createRecord('mix', {
        title: 'Mix ' + Ember.uuid(),
      });

      mix.save();
      this.transitionTo('mix', mix);
    }
  },

  model: function() {
    return this.get('store').find('mix');
  }
});
