var Backbone = require('backbone');
var debug = require('debug')('models:Track');

var URI = require('URIjs');
var $ = require('jquery');

var config = require('../config');
var clientId = config.clientId;
var echoApiKey = config.echoApiKey;

module.exports = Backbone.Model.extend({

  // TODO: do this
  //'idAttribute': '_id',

  // TODO: make it so id is converted into string 'soundcloud__{id}'
  // TODO: convert all references from cid to id
  defaults: function () {
    return {
      'playback_count': 0,
      'duration': 15000, // 15s for queue client test
      'linxType': 'song',
    }
  },

  getDefaultStart: function () {
    var def = 0;
    try {
      def = this.get('echoAnalysis').track.end_of_fade_in;
    } catch (e) { }
    return def;
  },

  getDefaultEnd: function () {
    var def = this.get('duration') / 1000;
    try {
      def = this.get('echoAnalysis').track.start_of_fade_out;
    } catch (e) { }
    return def;
  },

  // TODO: make so can save/upload


  // analyzes track from SC on echonest.
  analyze: function (options) {
    var track = this;
    debug("analyzing track in echonest", options)

    var next = function () {
      track.getProfile(options);
    };

    // first get echoId
    if (!track.get('echoId')) {
      var analyzer = new SCAnalyzer({ 'id': track.id });
      analyzer.fetch({
        'success': function (collection, response, _options) {
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
  getProfile: function (options) {
    var track = this;
    if (!(track.get('echoId'))) {
      return debug("WARNING: getProfile called without echoId", track);
    }

    var next = function () {

      var url = track.get('echoProfile').audio_summary.analysis_url;
      var count = 0;
      var attempt = function () {
        debug("ATTEMPT", count);
        $.getJSON(url, function (response) {
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
    };

    // if no track profile or analysis is pending, get track profile
    var echoProfile = track.get('echoProfile');
    if (!echoProfile || echoProfile.status !== 'complete') {
      var trackProfile = new TrackProfile({
        'echoId': track.get('echoId'),
      });
      trackProfile.fetch({
        'cache': false, // IMPORTANT: refresh analysis_url
        'success': function (collection, response, _options) {
          track.set({ 'echoProfile': response.response.track });
          next();
        },
      });
    // if already has, continue
    } else {
      next();
    }
  },

  // ignore deletes
  'sync': function (method, model, options) {
    if (method !== 'delete') {
      Backbone.sync.apply(this, arguments);
    }
  },

  // make tracks fetchable if given an id
  // TODO: find if already have a model for that id?
  'url': function () {
    var url = 'http://api.soundcloud.com/tracks/' + this.id + '.json';
    url += "?client_id=" + clientId;
    return url;
  },

  'urlRoot': '',
});

// get track profile from EchoNest given echoId
var TrackProfile = Backbone.Collection.extend({

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