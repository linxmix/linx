import Ember from 'ember';
import RequireParams from 'linx/mixins/require-params';

RequireParams.reopen({
  params: ['arrangementClip'],
});

export default Ember.Component.extend(RequireParams, {
  classNames: ['arrangement-clip'],

  // params
  clipType: Ember.computed.alias('arrangementClip.clipType'),
  clipModel: Ember.computed.alias('arrangementClip.clipModel'),
});
