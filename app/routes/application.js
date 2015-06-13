import Ember from 'ember';
// import Migrate from 'linx/lib/migrations/linx-meteor';

export default Ember.Route.extend({
  actions: {
    // onPageDrop: function(files) {
    //   console.log("page drop", files);
    //   var store = this.get('store');
    //   var arrangement = this.get('controller.arrangement');

    //   // for each file, add to new row
    //   var rows = files.map(function(file) {

    //     // create audio-clip, arrangement-clip, arrangement-row.
    //     var clip = store.createRecord('audio-clip', { file: file, type: 'audio-clip' });
    //     var arrangementClip = store.createRecord('arrangement-clip');
    //     var row = store.createRecord('arrangement-row');

    //     arrangementClip.set('clip', clip);
    //     row.addItem(arrangementClip);

    //     clip.save();
    //     arrangementClip.save();
    //     row.save();

    //     return row;
    //   });
      
    //   // then add to arrangement
    //   arrangement.appendRows(rows);
    // }
  },

  setupController: function(controller, models) {
    controller.setProperties(models);

    // Migrate(this.get('store'));
  },

  model: function() {
    var store = this.get('store');

    // Test
    // new Worker('assets/workers/file-decoder.js');

    return Ember.RSVP.hash({
      // tracks: store.find('track'),
      // items: store.find('arrangement-clip'),
      // item: store.findPolymorphic('arrangement-clip', 'clip', '-JpixY_gJcUYPDifgllk'),
      // item: store.find('arrangement-clip', '-JpixY_gJcUYPDifgllk'),
      // clip: store.find('audio-clip', '-JpixY_dno-W300KB5_J'),
      arrangement: store.createRecord('arrangement', {}),
    });
  }
});
