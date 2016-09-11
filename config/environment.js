/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'linx',
    // namespaced directory where resolver will look for resource files
    podModulePrefix: 'linx/pods',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    firebase: {
      apiKey: process.env.FIREBASE_SECRET,
      authDomain: process.env.FIREBASE_DB + '.firebaseapp.com',
      databaseURL: 'https://' + process.env.FIREBASE_DB + '.firebaseio.com',
      storageBucket: process.env.FIREBASE_DB + '.appspot.com',
    },

    torii: {
      sessionServiceName: 'session',
      providers: {
        'firebase-simple-auth': {
        }
      }
    },

    'ember-simple-auth': {
      authenticationRoute: 'login',
      routeAfterAuthentication: 'mixes',
    },

    contentSecurityPolicy: {
      // allow webworkers
      'default-src': "'self'",

      // allow firebase
      'connect-src': "'self' http://*.soundcloud.com https://*.soundcloud.com https://*.sndcdn.com wss://*.firebaseio.com http://developer.echonest.com http://*.amazonaws.com http://localhost:4004 https://*.googleapis.com",
      'frame-src': "'self' https://*.firebaseio.com",
      'script-src': "'self' 'unsafe-eval' 'unsafe-inline' https://*.firebaseio.com http://connect.soundcloud.com apis.google.com",

      // allow semantic-ui fonts and style
      'font-src': "'self' https://fonts.gstatic.com data:",
      'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
    },

    APP: {
      SC_REDIRECT_UI: 'http://localhost:3000/assets/soundcloud/callback.html',
    }
  };

  // Client API Keys
  ENV.S3_SECRET = process.env.S3_SECRET;
  ENV.S3_KEY = process.env.S3_KEY;
  ENV.S3_BUCKET = process.env.S3_BUCKET;
  ENV.S3_REGION = process.env.S3_REGION;
  ENV.S3_SIGNATURE_URL = process.env.S3_SIGNATURE_URL || 'http://localhost:4005';

  ENV.ECHONEST_KEY = process.env.ECHONEST_KEY;

  ENV.SC_KEY = process.env.SC_KEY;

  ENV.SONIC_API_ACCESS_ID = process.env.SONIC_API_ACCESS_ID;

  ENV.PROXY_URL = process.env.PROXY_URL || 'http://localhost:4004';

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
  }

  return ENV;
};
