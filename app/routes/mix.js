import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    saveMix() {
      var mix = this.get('controller.model');
      mix.save();
    },

    deleteMix() {
      var mix = this.get('controller.model');

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

    selectTrack(track) {
      let mix = this.get('controller.model');

      if (this.get('controller.insertTracksWithTransitions')) {
        mix.appendModelWithTransition(track);
      } else {
        mix.appendModel(track);
      }
    },

    addRandomTrack() {
      let mix = this.get('controller.model');
      mix.generateTransitionAndAppend({

      })

      if (this.get('controller.insertTracksWithTransitions')) {
        mix.appendModelWithTransition(track);
      } else {
        mix.appendModel(track);
      }
    },

    removeItem(mixItem) {
      let mix = this.get('controller.model');
      mix.removeObject(mixItem);
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
