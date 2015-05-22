import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend(
  AbstractListItemMixin('arrangement-row'), {

  start: DS.attr('number'),

  clip: DS.belongsTo('clip', { polymorphic: true, async: true }),
});
