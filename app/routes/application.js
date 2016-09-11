import Ember from 'ember';

// TODO(TECHDEBT): have to import faker here to get it to load into the tests
import Faker from 'npm:faker';

import Migrate from 'linx/lib/migrations/linx-meteor';

export default Ember.Route.extend({

  userSession: Ember.inject.service(),

  beforeModel() {
    return this.get('userSession').fetch().catch((e) => {
      console.log('User not logged in', e);
    });
  },

  setupController: function(controller, models) {
    controller.setProperties(models);

    // this.store.findAll('track').then((tracks) => {
    //   Migrate(this.get('store'));
    // });
  },

  model: function() {
    var store = this.get('store');

    // Test
    // new Worker('assets/workers/file-decoder.js');

    return Ember.RSVP.hash({
    });
  },

  actions: {
    accessDenied: function() {
      console.log('access denied');
      this.transitionTo('login');
    }
  }
});
