var Backbone = require('backbone');
var debug = require('debug')('collections:Transitions')

var Tracks = require('./Tracks');
var Edges = require('./Edges');
var Transition = require('../models/Transition');

module.exports = Tracks.extend({

  // make with edges collection
  initialize: function (options) {
    var edges = this.edges = new Edges();
    // add transition on edge add
    edges.on('add', function (edge, edges, options) {
      debug("ADDED EDGE", edge);
      this.add({ 'edge': edge }).fetch();
    }.bind(this));
    return Tracks.prototype.initialize.call(this, options);
  },

  // fetch from edges collection
  fetch: function (options) {
    this.edges.fetch({
      'success': function (edges, response, _options) {
        var cb = options.success;
        cb && cb(this, response, _options);
        this.edges.add({ 'edgeId': 13158665 });
      }.bind(this),
      'error': options.error,
    });
  },

  model: Transition,
});