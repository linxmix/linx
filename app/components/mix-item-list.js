import Ember from 'ember';
import RequireAttrs from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttrs('mix'), {

  classNames: ['mix-item-list', 'inverted', 'ui', 'selection', 'list']
});
