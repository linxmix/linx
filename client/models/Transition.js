var Backbone = require('backbone');

var Track = require('./Track');
var Edge = require('./Edge');

var _ = require('underscore');

module.exports = Track.extend({

  defaults: function () {
    var defaults = Track.prototype.defaults.apply(this, arguments);
    return _.defaults({
      'edge': new Edge(),
      'linxType': 'transition',
    }, defaults);
  },

  // ids

  getEdgeId: function () {
    return this.get('edge').get('edgeId');
  },

  getInId: function () {
    return this.get('edge').get('in');
  },

  getOutId: function () {
    return this.get('edge').get('out');
  },

  // timings

  getDefaultStart: function () {
    return this.get('edge').get('startEdge');
  },

  getDefaultEnd: function () {
    return this.get('edge').get('endEdge');
  },

  getEndIn: function () {
    return this.get('edge').get('endIn');
  },

  getStartOut: function () {
    return this.get('edge').get('startOut');
  },

});