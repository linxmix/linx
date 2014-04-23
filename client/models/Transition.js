var Backbone = require('backbone');

var Track = require('./Track');
var Edge = require('./Edge');

var _ = require('underscore');

module.exports = Track.extend({

  defaults: function () {
    var defaults = Track.prototype.defaults.apply(this, arguments);
    return _.defaults({
      'edge': new Edge(),
      'type': 'transition',
    }, defaults);
  },

});