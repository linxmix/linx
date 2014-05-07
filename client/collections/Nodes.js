var Backbone = require('backbone');
var debug = require('debug')('collections:Nodes')

var Node = require('../models/Node');

var Nodes = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.on("add", function(node) {
      debug("added node: " + node.id);
    });
    this.options = options;
  },

  model: Node,
});

// TODO: make certain tracks are songs
Nodes.makeFromTracks = function (tracks) {
  var nodes = tracks.map(function (track) {
    return {
      'id': track.id,
      'linxType': 'song',
      'track': track,
    };
  });
  return new Nodes(nodes);
};

module.exports = Nodes;