import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('tracks');
  this.route('track', { path: 'tracks/:id' });

  this.route('mixes', function() {
    this.route('mix', { path: ':mix_id' }, function() {
      this.route('transition', { path: 'transitions/:transition_id' });
    });
  });

  // TODO - delete fakes
  this.route('upload');
});

export default Router;
