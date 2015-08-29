import Ember from 'ember';
import DS from 'ember-data';

import ArrangementItem from './arrangement-item';
import MixListItemMixin from 'linx/mixins/models/mix-list-item';

import { variableTernary } from 'linx/lib/computed/ternary';

export default ArrangementItem.extend(MixListItemMixin, {
  type: 'mix-mix-item',

  nestedMix: DS.belongsTo('mix', { async: true }),
  tracks: Ember.computed.reads('nestedMix.tracks'),

  _clip: DS.belongsTo('mix-mix-item-clip', { async: true }),
  clip: withDefaultModel('_clip', function() {
    return this.get('store').createRecord('mix-mix-item-clip');
  }),
});
