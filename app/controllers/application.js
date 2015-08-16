import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),
  queue: Ember.computed.alias('session.queue'),
  isBottomBarActive: Ember.computed.gt('queue.numTracks', 0)
});
