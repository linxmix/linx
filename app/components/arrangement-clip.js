import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['arrangement-clip'],

  clipType: Ember.computed.alias('arrangementClip.clipType'),
  clipModel: Ember.computed.alias('arrangementClip.clipModel'),

  // expected params
  arrangementClip: null,
});
