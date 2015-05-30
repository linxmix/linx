import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    createTransition: function() {
      this.sendAction('createTransition');
    }
  },

  classNames: ['TransitionItem']
});
