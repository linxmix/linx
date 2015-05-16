import Ember from 'ember';
import NProgress from 'npm:nprogress';
import Wavesurfer from 'npm:wavesurfer.js';

export default Ember.Route.extend({
  actions: {
    loading: function() {
      this.showLoadingIndicator();
      return true;
    }
  },

  showLoadingIndicator: function() {
    NProgress.start();

    this.router.one('didTransition', function() {
      NProgress.done();
    });
  },

  model: function() {
    return new Ember.RSVP.Promise(function() {});
  }
})
