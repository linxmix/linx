import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes(), {

  actions: {},
  classNames: ['MixBuilderTracklist'],
  classNameBindings: [],

  // required params
  mix: null,
  selectTransition: Ember.K,
  playItem: Ember.K,
  removeItem: Ember.K,
  moveItem: Ember.K,

  // optional params
  selectedTransition: null,

  actions: {
    selectItem(item) {
      this.get('selectTransition')(item.get('transition'));
    }
  }
});

