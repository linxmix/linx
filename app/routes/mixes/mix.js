import Ember from 'ember';

import _ from 'npm:underscore';

import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

// export default Ember.Route.extend(PreventDirtyTransitionMixin, {
export default Ember.Route.extend({

  actions: {
    // TODO(TECHDEBT): move to mix-builder
    onPageDrop(files) {
      Ember.Logger.log("page drop", files);

      const store = this.get('store');
      const mix = this.get('controller.mix');

      // for each file, create track and add to mix
      files.map((file) => {

        const track = store.createRecord('track', {
          title: file.name,
          file,
        });

        track.get('audioBinary.analyzeAudioTask').perform();
        mix.appendTrack(track);
      });
    },

    openTransitionModal(transition) {
      this.transitionTo('mixes.mix.transition', transition.get('id'));
    },

    closeModal() {
      this.transitionTo('mixes.mix');
    }
  },

  setupController(controller, models) {
    return controller.setProperties(models);
  },

  model: function(params) {
    return this.get('store').find('mix', params.mix_id).then((mix) => {
      return { mix };
    }, (reason) => {
      this.transitionTo('mixes');
    });
  }
});
