import Ember from 'ember';
import DS from 'ember-data';
import ENV from 'linx/config/environment';
import ajax from 'ic-ajax';
import retryWithBackoff from 'ember-backoff/retry-with-backoff';

export default {
  name: 'Echonest',
  after: 'store',

  initialize: function(container, app) {
    var store = container.lookup('store:main');

    Echonest.reopen({
      store: store,
    });

    app.register("Echonest:main", Echonest);
    app.inject("model:track", "echonest", "Echonest:main");
    app.inject("model:echonest-track", "echonest", "Echonest:main");
  },
};

var Echonest = Ember.Object.extend({
  // TODO: move to config
  baseUrl: 'http://developer.echonest.com/api/v4',
  apiKey: ENV.ECHONEST_KEY,

  // expected params
  store: null,

  // fetch echonest-track from linx-track
  // TODO: identifyTrackMD5 first?
  fetchTrack: function(track) {
    return DS.PromiseObject.create({
      promise: this.uploadTrack(track).then((response) => {
        return this.get('store').find('echonest-track', response.id);
      }),
    });
  },

  uploadTrack: function(track) {
    console.log("fetching track from echonest", track);
    var streamUrl = track.get('streamUrl');

    Ember.assert('Track must have streamUrl to upload', streamUrl);

    return ajax({
      type: "POST",
      url: this.get('baseUrl') + '/track/upload',
      data: {
        api_key: this.get('apiKey'),
        url: streamUrl
      },
    }).then((response) => {
      console.log("fetch track id", response);
      return response.response.track;
    });
  },

  // TODO: on fail, retry upload
  fetchAnalysis: function(echonestTrack) {
    var analysisUrl = echonestTrack && echonestTrack.get('analysisUrl');

    Ember.assert('Track must have analysisUrl to get analysis', analysisUrl);

    return DS.PromiseObject.create({
      promise: retryWithBackoff(function() {
        return ajax({
          type: "GET",
          url: analysisUrl,
        });
      }, 5, 500),
    });
  },

  // TODO
  // identifyTrackMD5: function(md5, options) {
  //   console.log("attempt identifyMD5", md5);
  //   $.ajax({
  //     type: "GET",
  //     url: 'http://developer.echonest.com/api/v4/track/profile',
  //     data: {
  //       api_key: Config.apiKey_Echonest,
  //       md5: md5,
  //     },
  //     success: function(response) {
  //       options.onSuccess(Graviton.getProperty(response, 'response.track'));
  //     },
  //     error: function(xhr) {
  //       console.error(xhr);
  //       throw new Error('Failed to identifyMD5: ' + md5);
  //     },
  //   });
  // },
});
