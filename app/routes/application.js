import Ember from 'ember';
// import Migrate from 'linx/lib/migrations/linx-meteor';

export default Ember.Route.extend({
  setupController: function(controller, models) {
    controller.setProperties(models);

    // Migrate(this.get('store'));
  },

  model: function() {
    var store = this.get('store');

    // Test
    // new Worker('assets/workers/file-decoder.js');

    return Ember.RSVP.hash({
    });
  }
});
