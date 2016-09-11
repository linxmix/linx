import Ember from 'ember';

export default Ember.Controller.extend({
  // expected params
  mixes: null,
  tracks: null,

  userSession: Ember.inject.service(),

  sortedMixes: Ember.computed('mixes.@each.title', function() {
    return this.get('mixes').sortBy('title');
  }),

  myMixes: Ember.computed('sortedMixes.@each.createdBy', 'userSession.currentUser.uid', function() {
    return this.get('sortedMixes').filterBy('createdBy', this.get('userSession.currentUser.uid'));
  }),

  otherMixes: Ember.computed.setDiff('sortedMixes', 'myMixes'),
});
