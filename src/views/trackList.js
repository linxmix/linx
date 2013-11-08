var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.TrackListView = Backbone.Marionette.CompositeView.extend({
    'template': '#template-trackList',
    'itemView': Views.TrackView,
    'itemViewContainer': '#track-list',

    'events': {
      'click .create': 'create',
    },

    'create': function () {
      App.Tracks.tracker.trackList.create();
    },

    // create a new track for given clip
    'addClip': function (clip) {
      this.create({
        'clips': clip._id
      });

    }

  });

});