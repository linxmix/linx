import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('mixes'), {

  actions: {},
  classNames: ['MixesList', 'inverted ui selection list'],
  classNameBindings: [],

  // params
  foo: 'bar',
});

