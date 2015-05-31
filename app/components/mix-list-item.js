import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttributes('item'), {

  classNames: ['MixListItem', 'item'],

  actions: {
    createTransition: function() {
      this.sendAction('createTransitionAt', this.get('index'));
    },

    removeTransition: function() {
      this.sendAction('removeTransitionAt', this.get('index'));
    },

    removeTrack: function() {
      this.sendAction('removeTrackAt', this.get('index'));
    },
  },

  // params
  mix: Ember.computed.alias('item.mix'),
  index: Ember.computed.alias('item.index'),
  position: Ember.computed.alias('item.position'),
  isLastItem: function() {
    return this.get('index') + 1 === this.get('mix.length');
  }.property('index', 'mix.length'),
});
