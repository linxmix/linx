import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend(
  AbstractListItemMixin('arrangement-row'), {

  startBeat: DS.attr('number'), // starting beat in arrangement

  type: Ember.computed.alias('clip.type'),
  isReady: Ember.computed.bool('clip.isReady'),

  // TODO: standardize method of retrieving async object from promise on fulfill?
  clip: DS.belongsTo('clip', { polymorphic: true, async: true }),
});
