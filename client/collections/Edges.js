var Backbone = require('backbone');
var debug = require('debug')('collections:Edges')

var clientId = require('../config').clientId;

var Edge = require('../models/Edge');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    this.on("add", function(edge) {
      debug("added edge", edge);
    });
    this.options = options;
  },

  parse: function (response) {
    // convert dbEdge to queryEdge
    response = response.map(function (edge) {
      renameProperty.call(edge, 'subject', 'in');
      renameProperty.call(edge, 'object', 'out');
      renameProperty.call(edge, 'predicate', 'edgeId');
      return edge;
    });
    return response;
  },

  url: '/edges',
  model: Edge,
});

renameProperty = function (oldName, newName) {
  // Check for the old property name to avoid a ReferenceError in strict mode.
  if (this.hasOwnProperty(oldName)) {
    this[newName] = this[oldName];
    delete this[oldName];
  }
  return this;
};