import Ember from 'ember';

export default Ember.Controller.extend({

  // expected from route
  mix: null,

  // set by child routes
  showArrangement: true,

  actions: {
    didSelectClip(clip) {
      this.set('selectedClipId', clip && clip.get('id') || '');
    }
  },

  queryParams: ['selectedClipId'],
  selectedClipId: '',

  selectedClip: Ember.computed('selectedClipId', 'mix.clips.@each.id', function() {
    return this.get('mix.clips').findBy('id', this.get('selectedClipId'));
  }),
});
