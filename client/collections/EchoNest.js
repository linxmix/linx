var Backbone = require('backbone');
var debug = require('debug')('collections:EchoNest')

var echoApiKey = require('../config').echoApiKey;
var URI = require('URIjs');
var $ = require('jquery');

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

  // analyzes track from SC on echonest.
  analyzeSC: function (options) {
    debug("analyzing track in echonest", options)
    var track = options.track;
    if (!track) { return debug("WARNING: no track given to analyze"); }

    var next = function () {
      this.getTrackProfile(options);
    }.bind(this);

    // first get echoId
    if (!track.get('echoId')) {
      var analyzer = new SCAnalyzer({ 'id': track.id });
      analyzer.fetch({
        'success': function (collection, response, options) {
          debug("SC ANALYZED", response);
          track.set({ 'echoId': response.trid });
          next();
        },
      });
    // if already has, continue
    } else {
      next();
    }
  },

  // gets echonest track profile from given track's echoId
  // if options.fullAnalysis, will also retrieve full analysis docs
  getTrackProfile: function (options) {
    var track = options.track;
    if (!(track && track.get('echoId'))) {
      return debug("WARNING: getTrackProfile given improper track", track);
    }

    var next = function () {
      debug("getTrackProfile next", track, track.get('echoProfile').status);

      var url = track.get('echoProfile').audio_summary.analysis_url;
      var count = 0;
      var attempt = function () {
        debug("ATTEMPT", count);
        $.getJSON(url, function (response) {
          debug("ECHO FULL ANALYSIS", response);
          track.set({ 'echoAnalysis': response });
          options.success && options.success(track);
        }).fail(function (error) {
          debug("FAIL", error);
          if (count <= 5) {
            window.setTimeout(function () {
              count++;
              attempt();
            }, 5000);
          }
        });
      }

      // if wanting full analysis, resolve analysis URL
      if (options.fullAnalysis && !track.get('echoAnalysis')) {
        attempt();
      // otherwise, we're done here so call success
      } else {
        options.success && options.success(track);
      }
    }.bind(this);

    // if no track profile or analysis is pending, get track profile
    var echoProfile = track.get('echoProfile');
    if (!echoProfile || echoProfile.status !== 'complete') {
      var trackProfiles = new TrackProfiles({
        'echoId': track.get('echoId'),
      });
      trackProfiles.fetch({
        'cache': false, // IMPORTANT: refresh analysis_url
        'success': function (collection, response, options) {
          debug("ECHO PROFILED", response);
          track.set({ 'echoProfile': response.response.track });
          next();
        },
      });
    // if already has, continue
    } else {
      next();
    }
  },

});

//
// Sub Collections for URL queries
//

// get track profile from EchoNest given echoId
var TrackProfiles = Backbone.Collection.extend({

  initialize: function (options) {
    // add api key to options
    options['api_key'] = echoApiKey;
    this.options = options;
  },

  url: function () {
    var options = this.options;
    var url = "http://developer.echonest.com/api/v4/track/profile"
    url = new URI(url);
    url.query({
      'api_key': options.api_key,
      'id': options.echoId,
      'bucket': 'audio_summary',
    });
    return url;
  },

});

// determines SC track's corresponding echoId
var SCAnalyzer = Backbone.Collection.extend({

  initialize: function (options) {
    this.options = options;
  },

  url: function () {
    var options = this.options;
    var url = "http://labs.echonest.com/SCAnalyzer/analyze"
    url = new URI(url);
    url.query({ 'id': options.id });
    return url;
  },

});

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
