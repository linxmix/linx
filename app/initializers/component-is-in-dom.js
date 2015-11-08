import Ember from 'ember';

// update components to have a variable isInDom
Ember.Component.reopen({
  isInDom: false,

  _setIsInDom: function() {
    Ember.run.next(() => {
      if (!this.get('isDestroyed')) {
        this.set('isInDom', true);
      }
    });
  }.on('didInsertElement'),

  _unsetIsInDom: function() {
    this.set('isInDom', false);
  }.on('willDestroyElement'),
});

export default {
  name: 'ComponentIsInDom',

  initialize: function(app) {
  },
};
