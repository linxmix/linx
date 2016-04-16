import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes(), {

  actions: {},
  classNames: ['MixBuilderVisual'],
  classNameBindings: [],

  // params
  foo: 'bar',
});

