import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttributes('mixItem'), {

  classNames: ['mix-item', 'item'],

  // params
  track: Ember.computed.alias('mixItem.track'),
  transition: Ember.computed.alias('mixItem.transition'),
});
