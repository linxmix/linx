import Ember from 'ember';

export default Ember.Controller.extend({
  // expected params
  mixes: null,
  tracks: null,

  userSession: Ember.inject.service(),

  myMixes: Ember.computed('mixes.@each.createdBy', 'userSession.currentUser.uid', function() {
    return this.get('mixes').filterBy('createdBy', this.get('userSession.currentUser.uid'));
  }),
  sortedMyMixes: Ember.computed.sort('myMixes', 'myMixesSortOrder'),
  myMixesSortOrder: ['createdAt:desc'],

  otherMixes: Ember.computed.setDiff('mixes', 'myMixes'),
  sortedOtherMixes: Ember.computed.sort('otherMixes', 'otherMixesSortOrder'),
  otherMixesSortOrder: ['createdBy:desc', 'createdAt:desc'],
});
