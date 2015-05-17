import Ember from 'ember';

// TODO: convert to promise
export default Ember.Object.extend({
  isLoading: false,
  percent: 0,

  cancelProgress: function() {
    this.setProperties({
      isLoading: false,
      percent: 0,
    });

    // TODO: also have a way to cancel the actual process?
  }.on('destroy'),

  onProgress: function(percent) {
    this.setProperties({
      isLoading: true,
      percent: percent,
    });
  },

  onFinish: function() {
    this.setProperties({
      isLoading: false,
      percent: 0,
    });
  }
});
