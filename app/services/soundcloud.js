import Ember from 'ember';

import SC from 'npm:soundcloud';

import ENV from 'linx/config/environment';
import { asResolvedPromise } from 'linx/lib/utils';

export const REST_VERBS = 'get post put delete'.w();
export const RESOLVE_URL_REGEX = /https?:\/\/soundcloud.com\/.*/;

export default Ember.Service.extend({
  isSdkAuthenticated: false,
  isAuthenticated: Ember.computed.reads('isSdkAuthenticated'),
  sdk: Ember.computed(function() {
    let sdk = SC;

    sdk.initialize({
      client_id: ENV.SC_KEY,
      redirect_uri: ENV.APP.SC_REDIRECT_UI,
    });

    // let promise = (ENV.environment === 'test') ? asResolvedPromise(sdk) : sdk.connect();
    let promise = true ? asResolvedPromise(sdk) : sdk.connect();
    return promise.then(() => {
      this.set('isSdkAuthenticated', true);
      return sdk;
    });
  }),

  // when ready, execute given rest verb on the sdk
  // returns promise which resolves to the sdk response
  // TODO: force sdk to reauth on auth error?
  _rest: function(verb, url, options) {
    return this.get('sdk').then((sdk) => {
      return sdk[verb](url, options);
    });
  },

  _addRestMethods: function() {
    this.setProperties(REST_VERBS.reduce((properties, verb) => {
      properties[`${verb}Ajax`] = function(url, options) {
        return this._rest(verb, url, options);
      };

      return properties;
    }, {}));
  }.on('init'),

  store: Ember.inject.service(),

  resolveUrl(targetUrl = '') {
    Ember.assert('Must provide valid targetUrl to SoundcloudService#resolveUrl', targetUrl.match(RESOLVE_URL_REGEX));

    return this.getAjax('resolve.json', {
      url: targetUrl
    }).then((response) => {

      // TODO(TECHDEBT): why someones response.tracks?
      const track = response && response.tracks ? response.tracks[0] : response;

      if (response && response.streamable && response.stream_url) {
        console.log('track found', track, response.tracks);

        return track;
      } else {
        console.log('cannot stream', response);
      }
    });
  },
});
