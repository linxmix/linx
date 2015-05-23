/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'linx',
    // namespaced directory where resolver will look for resource files
    podModulePrefix: 'linx/pods',

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
      'connect-src': "'self' wss://*.firebaseio.com http://developer.echonest.com",
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

    // Client API Keys
    ENV.S3_SECRET = process.env.S3_SECRET;
    ENV.S3_KEY = process.env.S3_KEY;
    ENV.ECHONEST_KEY = process.env.ECHONEST_KEY;
    ENV.SC_KEY = process.env.SC_KEY;
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
