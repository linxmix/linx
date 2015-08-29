import Ember from 'ember';
import DS from 'ember-data';

import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';
import RequireAttributes from 'linx/lib/require-attributes';
import withDefault from 'linx/lib/computed/with-default';

export default Ember.Mixin.create(
  AbstractListItemMixin('mix'),
  RequireAttributes('startBeat'), {

  mix: DS.belongsTo('mix', { async: true }),

  prevClip: Ember.computed.reads('prevItem.clip'),
  nextClip: Ember.computed.reads('nextItem.clip'),

  prevItemIsTransition: Ember.computed.equal('prevItem.type', 'transition-mix-item'),
  prevItemIsValidTransition: Ember.computed.and('prevItemIsTransition', 'prevItem.isValid'),

  nextItemIsTransition: Ember.computed.equal('nextItem.type', 'transition-mix-item'),
  nextItemIsValidTransition: Ember.computed.and('nextItemIsTransition', 'nextItem.isValid'),

  // overridable properties
  isValid: true,
  tracks: Ember.computed(() => { return []; }),
  firstTrack: Ember.computed.reads('tracks.firstObject'),
  lastTrack: Ember.computed.reads('tracks.lastObject'),

  // overlap with prevItem if is transition
  defaultStartBeat: withDefault('prevItem.endBeat', 0),
  startBeat: variableTernary('prevItemIsValidTransition', 'prevItem.startBeat', 'defaultStartBeat'),
});
