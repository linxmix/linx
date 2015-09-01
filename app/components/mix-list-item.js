import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('model'), {

  actions: {},
  classNames: ['MixListItem', 'item'],
  classNameBindings: [],

  // params
  mix: Ember.computed.alias('model.mix'),
  index: Ember.computed.alias('model.index'),
  position: Ember.computed.alias('model.position'),
  isLastItem: function() {
    return this.get('index') + 1 === this.get('mix.length');
  }.property('index', 'mix.length'),
});

