import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend(
  AbstractListItemMixin('arrangement-row'), {

  startBeat: DS.attr('number'), // starting beat in arrangement
  clip: DS.belongsTo('clip', { polymorphic: true, async: true }),

  length: Ember.computed.alias('clip.length'),
});
