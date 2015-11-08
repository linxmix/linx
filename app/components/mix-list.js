import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('mix'), {

  actions: {},
  classNames: ['MixList', 'inverted ui list'],
  classNameBindings: [],

  // params
  foo: 'bar',
});

