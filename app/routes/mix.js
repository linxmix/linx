import Ember from 'ember';

import _ from 'npm:underscore';

import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

export default Ember.Route.extend(PreventDirtyTransitionMixin, {
  actions: {
    saveMix() {
      this.get('controller.model').save();
    },

    deleteMix() {
      let mix = this.get('controller.model');

      if (window.confirm("Are you sure you want to delete this mix? It cannot be restored once deleted.")) {
        mix.destroyRecord();
        this.transitionTo('mixes');
      }
    },

    onPageDrop(files) {
      console.log("page drop", files);

      var store = this.get('store');

      // for each file, create track and add to mix
      files.map((file) => {
        var track = store.createRecord('track', {
          title: file.name,
        });

        this.send('appendTrack', track);
      });
    },

    transitionToTransition(transition) {
      this.transitionTo('transition', transition);
    },
  },

  model: function(params) {
    return this.get('store').find('mix', params.id).then((mix) => {
      return mix;
    }, (reason) => {
      this.transitionTo('mixes');
    });
  }
});
