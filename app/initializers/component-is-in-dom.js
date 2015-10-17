import Ember from 'ember';

// update components to have a variable isInDom
Ember.Component.reopen({
  isInDom: false,

  _setIsInDom: function() {
    this.set('isInDom', true);
  }.on('didInsertElement'),

  _unsetIsInDom: function() {
    this.set('isInDom', false);
  }.on('willDestroyElement'),
});

export default {
  name: 'ComponentIsInDom',

  initialize: function(registry, app) {
  },
};
