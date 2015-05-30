import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('track', params.id).then((track) => {
      return track;
    }, (reason) => {
      return null;
    });
  }
});
