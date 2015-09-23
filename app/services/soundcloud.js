import Ember from 'ember';

import retryWithBackoff from 'ember-backoff/retry-with-backoff';

import ReadinessMixin from 'linx/mixins/readiness';

import ENV from 'linx/config/environment';
import { asResolvedPromise } from 'linx/lib/utils';

export const REST_VERBS = 'get post put delete'.w();

export default Ember.Service.extend(
  ReadinessMixin('isSdkLoaded'), {

  isSdkLoaded: false,
  isSdkAuthenticated: false,
  isAuthenticated: Ember.computed.reads('isSdkAuthenticated'),
  sdk: Ember.computed(function() {
    return this._loadSdk().then((sdk) => {
      return sdk;
    });
  }),

  // when ready, execute given rest verb on the sdk
  // returns promise which resolves to the sdk response
  // if performing non-get method, authenticate first
  // TODO: force sdk to reauth on auth error?
  _rest: function(verb, url, options) {
    if (!this.get('isAuthenticated') && verb !== 'get') {
      return this._authenticateSdk().then(() => {
        this._rest.apply(this, arguments);
      });
    }

    return this.get('sdk').then((sdk) => {
      return new Ember.RSVP.Promise((resolve, reject) => {
        sdk[verb](url, options, (response, error) => {
          Ember.run(() => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
        });
      });
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

  _loadSdk: function() {
    if (this.get('isSdkLoaded')) {
      return this.get('sdk');
    } else {
      // Load the soundcloud sdk onto the page
      var script = document.createElement('script');

      script.async = true;
      script.src = document.location.protocol + '//connect.soundcloud.com/sdk-2.0.0.js';
      document.body.appendChild(script);

      // return promise that resolves to SDK, once it's loaded
      return new Ember.RSVP.Promise((resolve, reject) => {
        let checkForLoad = () => {
          Ember.run.later(() => {
            if (window.SC) {
              this.set('isSdkLoaded', true);
              resolve(window.SC);
            } else {
              checkForLoad();
            }
          }, 50);
        };

        checkForLoad();
      });
    }
  },

  // return promise that resolves once the SDK is authenticated
  _authenticateSdk: function(sdk) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (this.get('isSdkAuthenticated')) {
        resolve(sdk);
      } else {
        sdk.connect(() => {
          this.set('isSdkAuthenticated', true);
          resolve(sdk);
        });
      }
    });
  },
});
