var Backbone = require('backbone');
var debug = require('debug')('models:Track');

var clientId = require('../config').clientId;

module.exports = Backbone.Model.extend({

  // TODO: make it so id is converted into string 'soundcloud__{id}'
  // TODO: convert all references from cid to id
  defaults: function () {
    return {
      'playback_count': 0,
      'duration': 15000, // 15s for queue client test
      'linxType': 'song',
    }
  },

  getDefaultStart: function () {
    return 0;
  },

  getDefaultEnd: function () {
    return this.get('duration') / 1000;
  },

  // make tracks fetchable if given an id
  // TODO: find if already have a track model for that id?
  'url': function () {
    var url = 'http://api.soundcloud.com/tracks/' + this.id + '.json';
    url += "?client_id=" + clientId;
    return url;
  },

  'urlRoot': '',
});