import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions('remove'), RequireAttributes('item'), {

  actions: {},
  classNames: ['MixListItem', 'item'],
  classNameBindings: [],

  // params
  mix: Ember.computed.reads('item.mix'),
  index: Ember.computed.reads('item.index'),
  position: Ember.computed.reads('item.position'),
  isLastItem: function() {
    return this.get('index') + 1 === this.get('mix.length');
  }.property('index', 'mix.length'),
});

