import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    remove: function() {
      this.sendAction('remove');
    }
  },

  // expected params
  track: null,

  classNames: ['TrackItem']
});
