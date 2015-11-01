import Ember from 'ember';

export default Ember.Controller.extend({
  // expected params
  model: null,

  actions: {
    viewItem(mixItem) {
      mixItem.get('transitionClip.readyPromise').then((clip) => {
        this.set('scrollCenterBeat', clip.get('centerBeat'));
      });
    },
  },

  scrollCenterBeat: 0,

  searchTracks: Ember.computed(function() {
    return this.get('store').findAll('track');
  }),
});
