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
      var mix = this.get('controller.model');

      // for each file, create track and add to mix
      files.map((file) => {
        var track = store.createRecord('track', {
          title: file.name,
        });
        var mixItem = store.createRecord('mix-item');

        mixItem.set('track', track);

        mix.pushObject(mixItem);
      });
    }
  }
});
