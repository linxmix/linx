import Ember from 'ember';

export default Ember.Controller.extend({
  queue: Ember.inject.service(),
  isBottomBarActive: Ember.computed.gt('queue.mix.numTracks', -1)
});
