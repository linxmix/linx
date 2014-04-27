var Backbone = require('backbone');
var debug = require('debug')('models:Track');

var clientId = require('../config').clientId;

module.exports = Backbone.Model.extend({

  // TODO: do this
  //'idAttribute': '_id',

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
    var def = 0;
    try {
      def = this.get('echoAnalysis').track.end_of_fade_in;
    } catch (e) { }
    return def;
  },

  getDefaultEnd: function () {
    var def = this.get('duration') / 1000;
    try {
      def = this.get('echoAnalysis').track.start_of_fade_out;
    } catch (e) { }
    return def;
  },

  // TODO: make so can save/upload

  // make tracks fetchable if given an id
  // TODO: find if already have a model for that id?
  'url': function () {
    var url = 'http://api.soundcloud.com/tracks/' + this.id + '.json';
    url += "?client_id=" + clientId;
    return url;
  },

  'urlRoot': '',
});