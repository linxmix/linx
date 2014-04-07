var Backbone = require('backbone');
var debug = require('debug')('collections:TasteProfiles')

var echoApiKey = require('../config').echoApiKey;
var URI = require('URIjs');

var TasteProfile = require('../models/TasteProfile');

module.exports = Backbone.Collection.extend({

  initialize: function (options) {
    // curry args
    if (typeof options !== 'object') {
      options = {'results': 100};
    }
    // add api key to options
    options['api_key'] = echoApiKey;
    this.options = options;
  },

  // generate url from given options
  url: function () {
    var options = this.options;
    // base url
    var url = new URI("http://developer.echonest.com/api/v4/catalog/list");
    // add options to url
    url.query(options);
    console.log("MAKING URL", url);
    return url;
  },

  parse: function (response) {
    debug("response", response);
    return response.response.catalogs;
  },

  model: TasteProfile,
});