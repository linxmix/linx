import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend(
  AbstractListItemMixin('arrangement-row'), {

  type: Ember.computed.alias('clip.type'),

  startBeat: DS.attr('number'), // starting beat in arrangement
  length: Ember.computed.alias('clip.length'),

  clip: DS.belongsTo('clip', { polymorphic: true, async: true }),
});
