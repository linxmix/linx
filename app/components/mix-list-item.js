import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions('remove'), RequireAttributes('model'), {

  actions: {},
  classNames: ['MixListItem', 'item'],
  classNameBindings: [],

  // params
  mix: Ember.computed.reads('model.mix'),
  index: Ember.computed.reads('model.index'),
  position: Ember.computed.reads('model.position'),
  isLastItem: function() {
    return this.get('index') + 1 === this.get('mix.length');
  }.property('index', 'mix.length'),
});

