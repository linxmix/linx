/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    sassOptions: {
      includePaths: []
    },
    // ember-cli-dotenv
    dotEnv: {
      clientAllowedKeys: ['S3_SECRET', 'S3_KEY', 'ECHONEST_KEY', 'SC_KEY']
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import('vendor/js/soundtouch.min.js');

  // WebAudioTestApi overrides native globals; only import when testing
  if (app.env === 'test') {
    app.import('bower_components/web-audio-test-api/build/web-audio-test-api.js');
  }

  // TODO(CLEANUP): is this necessary still?
  // Hack webworker support
  // http://stackoverflow.com/questions/24175120/ember-cli-project-and-web-workers
  var pickFiles = require('broccoli-static-compiler');

  var workers = pickFiles('workers', {
    srcDir: '/',
    files: ['*.js'],
    destDir: '/assets/workers'
  });

  if (process.env.EMBER_ENV === 'production') {
    workers = require('broccoli-uglify-js')(workers, {
      mangle: true,
      compress: true
    });
  }

  return app.toTree(workers);
};
