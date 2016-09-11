import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['site-nav', 'ui', 'fixed', 'inverted', 'main', 'menu'],

  session: Ember.inject.service(),
});
