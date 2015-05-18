import Ember from 'ember';
import RequireParams from 'linx/mixins/require-params';

RequireParams.reopen({
  params: ['progress'],
});

export default Ember.Component.extend(RequireParams, {
  classNames: ['progress-bar'],
  classNameBindings: ['isLoading::hidden'],

  // TODO: update when percent given

  // params
  isLoading: Ember.computed.alias('progress.isLoading'),
});
