var Backbone = require('backbone');

var Track = require('./Track');
var Edge = require('./Edge');

var _ = require('underscore');

module.exports = Track.extend({

  defaults: function () {
    var defaults = Track.prototype.defaults.apply(this, arguments);
    return _.defaults({
      'linxType': 'transition',
      'transitionType': 'soft',
      'in': null,
      'out': null,
    }, defaults);
  },

  save: function () {
    return false;    
  },

  // ids

  getEdgeId: function () {
    return 'soft';
  },

  getInId: function () {
    return this.get('in');
  },

  getOutId: function () {
    return this.get('out');
  },

  // timings

  getDefaultStart: function () {
    return false;
  },

  getDefaultEnd: function () {
    return false;
  },

  getEndIn: function () {
    return false;
  },

  getStartOut: function () {
    return false;
  },

});