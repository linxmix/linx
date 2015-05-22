import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    createMix: function() {
      var mix = this.get('store').createRecord('mix', {
        title: 'Mix' + this.get('controller.model.length')
      });

      this.transitionTo('mix', mix);
    }
  },

  model: function() {
    return this.get('store').find('mix');
  }
});
