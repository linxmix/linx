import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    onPageDrop: function(files) {
      console.log("page drop", files);
      var store = this.get('store');
      var arrangement = this.get('controller.arrangement');

      // for each file, add to new row
      var rows = files.map(function(file) {

        // create audio-clip, arrangement-clip, arrangement-row.
        var audioClip = store.createRecord('audio-clip', { file: file, });
        var clip = store.createRecord('arrangement-clip');
        var row = store.createRecord('arrangement-row');

        clip.set('audioClip', audioClip);
        row.addClip(clip);

        return row;
      });
      
      // then add to arrangement
      arrangement.appendRows(rows);
    }
  },

  setupController: function(controller, models) {
    controller.setProperties(models);
  },

  model: function() {
    var store = this.get('store');

    // Test
    // new Worker('assets/workers/file-decoder.js');

    return Ember.RSVP.hash({
      arrangement: store.createRecord('arrangement', {}),
    });
  }
});
