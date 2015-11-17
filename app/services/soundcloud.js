import Ember from 'ember';

import retryWithBackoff from 'ember-backoff/retry-with-backoff';
import SC from 'npm:soundcloud';

import ReadinessMixin from 'linx/mixins/readiness';

import ENV from 'linx/config/environment';
import { asResolvedPromise } from 'linx/lib/utils';

export const REST_VERBS = 'get post put delete'.w();

export default Ember.Service.extend({
  isSdkAuthenticated: false,
  isAuthenticated: Ember.computed.reads('isSdkAuthenticated'),
  sdk: Ember.computed(function() {
    let sdk = SC;

    sdk.initialize({
      client_id: ENV.SC_KEY,
      redirect_uri: ENV.APP.SC_REDIRECT_UI,
    });

    console.log(ENV.APP.SC_REDIRECT_UI)

    return sdk.connect().then(() => {
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
});
