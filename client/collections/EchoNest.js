var Backbone = require('backbone');
var debug = require('debug')('collections:EchoNest')

var echoApiKey = require('../config').echoApiKey;
var URI = require('URIjs');

var Track = require('../models/Track');

// collection which lifts the weight of searching
var SearchResults = Backbone.Collection.extend({

  initialize: function (options) {
    // curry args
    if (typeof options !== 'object') {
      options = {};
    }
    if (typeof options.query !== 'object') {
      options.query = {};
    }
    if (typeof options.url !== 'string') {
      options.url = '';
    }
    // add api key to options.query
    options.query['api_key'] = echoApiKey;
    this.options = options;
  },

  // generate url from given options
  url: function () {
    var options = this.options;
    // base url
    var url = "http://developer.echonest.com/api/v4/" + options.url;
    url = new URI(url);
    // add options.query to url
    url.query(options.query);
    return url;
  },

  parse: function (response) {
    response = response['response'];
    // extract the part of the response that is not the status
    var results = [];
    var keys = Object.keys(response);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== 'status') {
        results = response[keys[i]];
        break;
      }
    }
    return results;
  }

});

// collection which offers functions to create appropriate search collections
module.exports = Backbone.Collection.extend({

  // called with {query, url, success, error}
  search: function (options) {
    debug("searching echonest", options)
    var results = new SearchResults(options);
    results.fetch({
      'success': options.success,
      'error': options.error || function (collection, response, options) {
        debug("Error with search", response);
      }
    });
  },

  searchSongs: function (options) {
    if (typeof options !== 'object') {
      options = {};
    }
    options['url'] = 'song/search';
    this.search(options);
  },

  searchArtists: function (options) {
    if (typeof options !== 'object') {
      options = {};
    }
    options['url'] = 'artist/search';
    this.search(options);
  },

});
