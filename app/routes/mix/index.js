import Ember from 'ember';

export default Ember.Route.extend({
  actions: {  
    saveMix: function() {
      var mix = this.get('controller.model');

      mix.save();
    },

    deleteMix: function() {
      var mix = this.get('controller.model');

      if (window.confirm("Are you sure you want to delete this mix? It cannot be restored once deleted.")) {
        mix.destroyRecord();
        this.transitionTo('mixes');
      }
    },

    onPageDrop: function(files) {
      console.log("page drop", files);

      var store = this.get('store');

      // for each file, create track and add to mix
      files.map((file) => {
        var track = store.createRecord('track', {
          title: file.name,
        });

        this.send('addTrack', track);
      });
    },

    addTrack: function(track) {
      console.log("addTrack", track);
      var mix = this.get('controller.model');

      var mixItem = this.get('store').createRecord('mix-item');
      mixItem.set('track', track);

      mix.pushObject(mixItem);
    },
  },

  setupController: function(controller, model) {
    this.get('store').find('track').then((tracks) => {
      controller.set('tracks', tracks.get('content'));
    });

    this._super.apply(this, arguments);
  }
});
