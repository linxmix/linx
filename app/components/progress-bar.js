import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['progress-bar'],
  classNameBindings: ['isLoading::hidden'],

  // TODO: update when percent given

  // params
  isLoading: Ember.computed.alias('progress.isLoading'),

  // expected params
  progress: null,
});
