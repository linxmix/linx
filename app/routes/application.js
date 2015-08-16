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
      // tracks: store.find('track'),
      // items: store.find('arrangement-clip'),
      // item: store.findPolymorphic('arrangement-clip', 'clip', '-JpixY_gJcUYPDifgllk'),
      // item: store.find('arrangement-clip', '-JpixY_gJcUYPDifgllk'),
      // clip: store.find('audio-clip', '-JpixY_dno-W300KB5_J'),
      arrangement: store.createRecord('arrangement', {}),
    });
  }
});
