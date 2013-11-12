var Linx = require('../../');

module.exports = Linx.module('Samples', function (Samples, App, Backbone, Marionette, $, _) {

  Samples.Transition = Samples.Sample.extend({

    'defaults': function () {
      return {
        'type': 'sample',
        'sampleType': 'transition',
        'name': "unnamed sample",
        'volume': 1.0,
        'transitionType': 'active',
        'startSongVolume': 0.8,
        'endSongVolume': 0.8,
         /* dj startSong endSong startSongEnd endSongStart */
      };
    },

  });
});