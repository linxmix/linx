import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import lookup from 'linx/lib/computed/lookup';

export const MODEL_LINK_TOS = {
  track: 'track',
  transition: 'transition',
  mix: 'mix',
}

export default Ember.Component.extend(
  BubbleActions('remove'), RequireAttributes('item'), {

  actions: {},
  classNames: ['MixListItem', 'item'],
  classNameBindings: [],

  modelName: Ember.computed.reads('item.modelName'),
  modelLinkTo: lookup('modelName', MODEL_LINK_TOS),

  // params
  mix: Ember.computed.reads('item.mix'),
  index: Ember.computed.reads('item.index'),
  position: Ember.computed.reads('item.position'),
  isLastItem: function() {
    return this.get('index') + 1 === this.get('mix.length');
  }.property('index', 'mix.length'),
});

