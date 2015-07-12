import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

export default DS.Model.extend(
  AbstractListItemMixin('arrangement'), AbstractListMixin('arrangement-clip'), {

  clips: Ember.computed.alias('items'),

  createClip: function(...args) {
    this.createItem.apply(this, args);
  }
});
