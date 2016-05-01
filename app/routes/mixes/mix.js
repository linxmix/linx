import Ember from 'ember';

import _ from 'npm:underscore';

import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

// export default Ember.Route.extend(PreventDirtyTransitionMixin, {
export default Ember.Route.extend({
  s3Upload: Ember.inject.service(),

  actions: {
    saveMix() {
      this.get('controller.mix').save();
    },

    deleteMix() {
      let mix = this.get('controller.mix');

      if (window.confirm("Are you sure you want to delete this mix? It cannot be restored once deleted.")) {
        mix.destroyRecord();
        this.transitionTo('mixes');
      }
    },

    onPageDrop(files) {
      Ember.Logger.log("page drop", files);

      var store = this.get('store');

      // this.get('s3').uploadFile(files[0]);
      this.get('s3Upload').uploadFile(files[0]);

      // for each file, create track and add to mix
      // files.map((file) => {
      //   var track = store.createRecord('track', {
      //     title: file.name,
      //   });

      //   this.send('appendTrack', track);
      // });
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
