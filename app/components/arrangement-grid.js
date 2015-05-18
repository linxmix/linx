import Ember from 'ember';
import RequireParams from 'linx/mixins/require-params';

RequireParams.reopen({
  params: ['arrangement'],
});

export default Ember.Component.extend(RequireParams, {
  classNames: ['arrangement-grid'],
});
