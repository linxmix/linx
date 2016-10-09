import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.authenticatedRoute('tracks');
  this.authenticatedRoute('track', { path: 'tracks/:id' });

  this.authenticatedRoute('mixes', function() {
    this.route('mix', { path: ':mix_id' }, function() {
      this.route('transition', { path: 'transitions/:transition_id' });
    });
  });

  this.route('login');
});

export default Router;
