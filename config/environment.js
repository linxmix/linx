/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'linx',
    // namespaced directory where resolver will look for resource files
    podModulePrefix: 'linx/pods',

    echonest: {
      api_key: 'CWBME38JDGQNEJPXT',
    },

    souncloud: {
      api_key: '977ed530a2104a95eaa87f26fa710941',
    },

    environment: environment,
    firebase: 'https://linx-2-acceptance.firebaseio.com/',
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    contentSecurityPolicy: {
      // allow webworkers
      'default-src': "'self'",

      // allow firebase
      'connect-src': "'self' wss://*.firebaseio.com",
      'frame-src': "'self' https://*.firebaseio.com",
      'script-src': "'self' 'unsafe-inline' https://*.firebaseio.com",

      // allow semantic-ui fonts and style
      'font-src': "'self' https://fonts.gstatic.com data:",
      'style-src': "'self' https://fonts.googleapis.com",
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    // set prod backend
    ENV.firebase = 'https://linx-2.firebaseio.com/';
  }

  return ENV;
};
