import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('tracks');
  this.route('track', { path: 'tracks/:id' });

  this.route('transitions');
  this.route('transition', { path: 'transitions/:id' });

  this.route('mixes');
  this.route('mix', { path: 'mixes/:id' });

  // TODO - delete fakes
  this.route('upload');
});

export default Router;
