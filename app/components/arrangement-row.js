import Ember from 'ember';
import RequireParams from 'linx/mixins/require-params';

RequireParams.reopen({
  params: ['row'],
});

export default Ember.Component.extend(RequireParams, {
  classNames: ['arrangement-row'],

  // expected params
  row: null
});
