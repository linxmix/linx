import Ember from 'ember';

export default Ember.Route.extend({

  setupController: function(controller, models) {
    controller.setProperties(models);
  },

  model: function(params) {
    var mix = this.modelFor('mix');
    var index = parseInt(params.index, 10);
    var fromMixItem = mix.get('content').objectAt(index);
    var toMixItem = mix.get('content').objectAt(index + 1);

    // if fromMixItem and toMixItem don't exist, redirect to mix
    // TODO: move this?
    if (!(fromMixItem && toMixItem)) {
      this.transitionTo('mix');
    }

    var fromTrack = fromMixItem.get('track');
    var toTrack = toMixItem.get('track');

    var transition = fromMixItem.get('transition');

    if (!transition) {
      transition = this.get('store').createRecord('transition');
      transition.set('fromTrack', fromTrack);
      transition.set('toTrack', toTrack);
    }

    return Ember.RSVP.hash({
      transition: transition,
    });
  }
});
