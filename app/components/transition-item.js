import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    remove: function() {
      this.sendAction('remove');
    },

    create: function() {
      this.sendAction('create');
    }
  },

  classNames: ['TransitionItem']
});
