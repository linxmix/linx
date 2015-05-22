import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('tracks');
  this.route('track', { path: 'tracks/:id' });

  this.route('mixes');
  this.route('mix', { path: 'mixes/:id' }, function() {
    this.route('transition', { path: 'transitions/:index' });
  });

  // TODO - delete fakes
  this.route('upload');

});

export default Router;
