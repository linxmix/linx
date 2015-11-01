import Ember from 'ember';

import _ from 'npm:underscore';

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

      mix.generateAndAppendTransition({
        toTrack: track
      });
    },

    addRandomTrack() {
      let mix = this.get('controller.model');
      let tracks = this.get('controller.searchTracks.content');
      let randomTrack = _.sample(tracks.toArray());

      mix.generateAndAppendTransition({
        toTrack: randomTrack
      });
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
