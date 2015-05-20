import Ember from 'ember';
import RequireAttrs from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttrs('model'), {

  classNames: ['audio-clip'],
});
