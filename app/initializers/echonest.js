import Ember from 'ember';
import DS from 'ember-data';
import ENV from 'linx/config/environment';
import ajax from 'ic-ajax';
import retryWithBackoff from 'ember-backoff/retry-with-backoff';
import RequireAttributes from 'linx/lib/require-attributes';
import { isObject } from 'linx/lib/utils';

export default {
  name: 'Echonest',

  initialize: function(app) {
    app.register("Echonest:main", Echonest);
    app.inject("model:track", "echonest", "Echonest:main");
    app.inject("model:echonest/track", "echonest", "Echonest:main");
  },
};

var Echonest = Ember.Object.extend({
  store: Ember.inject.service(),

  // TODO: move to config
  baseUrl: 'http://developer.echonest.com/api/v4',
  apiKey: ENV.ECHONEST_KEY,

  // fetch echonest/track from linx-track
  // TODO: identifyTrackMD5 first?
  fetchTrack: function(track) {
    return DS.PromiseObject.create({
      promise: this.uploadTrack(track).then((response) => {
        return this.get('store').findRecord('echonest/track', response.id);
      }),
    });
  },

  uploadTrack: function(track) {
    let streamUrl = track.get('audioBinary.streamUrl');
    console.log("uploading track to echonest", track, streamUrl);

    Ember.assert('Track must have streamUrl to upload', streamUrl);

    return ajax({
      type: "POST",
      url: this.get('baseUrl') + '/track/upload',
      data: {
        api_key: this.get('apiKey'),
        url: streamUrl
      },
    }).then((response) => {
      // TODO(CLEANUP): better error handling here
      if (!Ember.get(response, 'response.track.id')) {
        console.log("WARNING: ANALYSIS INCOMPLETE", )
      }
      return response.response.track;
    });
  },

  // TODO: on fail, retry upload
  fetchAnalysis: function(analysisUrl) {
    return DS.PromiseObject.create({
      promise: retryWithBackoff(function() {
        return ajax({
          type: "GET",
          url: analysisUrl,
        }).then((result) => {
          return isObject(result) ? result : JSON.parse(result);
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
