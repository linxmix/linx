import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

//
// begin silence deprecations
//
if (Ember.Debug && typeof Ember.Debug.registerDeprecationHandler === 'function') {
  Ember.Debug.registerDeprecationHandler((message, options, next) => {
    if (options && options.until && options.until !== '2.0.0') {
      return;
    }
    next(message, options);
  });
}
//
// end silence deprecations
//


var App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
