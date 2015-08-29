import Ember from 'ember';
import DS from 'ember-data';

import ArrangementItem from './arrangement-item';
import MixListItemMixin from 'linx/mixins/models/mix-list-item';

import { variableTernary } from 'linx/lib/computed/ternary';

export default ArrangementItem.extend(MixListItemMixin, {
  type: 'track-mix-item',

  track: DS.belongsTo('track', { async: true }),

  tracks: function() {
    return [this.get('track')];
  }.property('track'),

  _clip: DS.belongsTo('track-mix-item-clip', { async: true }),
  clip: withDefaultModel('_clip', function() {
    return this.get('store').createRecord('track-mix-item-clip');
  }),
});
