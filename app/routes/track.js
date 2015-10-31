import Ember from 'ember';
import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

export default Ember.Route.extend(PreventDirtyTransitionMixin, {
  actions: {
    saveTrack() {
      this.get('controller.model').save();
    },

    deleteTrack() {
      let track = this.get('controller.model');

      if (window.confirm("Are you sure you want to delete this track? It cannot be restored once deleted.")) {
        track.destroyRecord();
      }
    }
  },

  model: function(params) {
    return this.get('store').find('track', params.id);
  }
});
