var Backbone = require('backbone');
var debug = require('debug')('collections:Links')

var Link = require('../models/Link');

module.exports = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.on("add", function(link) {
      debug("added link: " + link.id);
    });
    this.options = options;
  },

  model: Link,
});