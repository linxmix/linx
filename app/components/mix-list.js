import Ember from 'ember';
import RequireAttrs from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttrs('mix'), {

  classNames: ['MixList', 'inverted ui selection list']
});
