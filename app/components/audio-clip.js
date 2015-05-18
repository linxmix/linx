import Ember from 'ember';
import RequireParams from 'linx/mixins/require-params';

RequireParams.reopen({
  params: ['model'],
});

export default Ember.Component.extend(RequireParams, {
  classNames: ['audio-clip'],
});
