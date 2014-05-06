var Backbone = require('backbone');
var debug = require('debug')('collections:Links')

var Link = require('../models/Link');

var Links = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.on("add", function(link) {
      debug("added link: " + link.id);
    });
    this.options = options;
  },

  model: Link,
});

// TODO: make certain tracks are transitions
Links.makeFromTracks = function (tracks) {
  var links = tracks.map(function (track) {
    return {
      'id': track.id,
      'linxType': track.get('linxType'),
      'track': track,
    };
  });
  return new Links(links);
};

module.exports = Links;