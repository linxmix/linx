import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('mixItem'), {

  actions: {},
  classNames: ['MixCardItem', 'ui card'],
  classNameBindings: [],

  // params
  foo: 'bar',
});

