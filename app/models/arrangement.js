import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';

export default DS.Model.extend(
  AbstractListMixin('arrangement-row'), {

  arrangedRows: Ember.computed.alias('arrangedContent'),
});
