import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttributes('mixItem'), {

  classNames: ['MixItem', 'item'],

  actions: {
    createTransition: function() {
      this.sendAction('createTransition', this.get('index'));
    }
  },

  // params
  mix: Ember.computed.alias('mixItem.mix'),
  track: Ember.computed.alias('mixItem.track'),
  transition: Ember.computed.alias('mixItem.transition'),
  index: Ember.computed.alias('mixItem.index'),
  isLastItem: function() {
    return this.get('index') + 1 === this.get('mix.length');
  }.property('index', 'mix.length'),
});
