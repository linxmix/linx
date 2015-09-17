import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('mix'), {

  actions: {},
  classNames: ['MixesListItem', 'item'],
  classNameBindings: [],

  click() {
    // this.sendAction('select', this.get('mix'));
  },

  // params
  foo: 'bar',
});

