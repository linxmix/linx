import Ember from 'ember';
import DS from 'ember-data';

import ArrangementItem from './arrangement-item';
import MixEventMixin from 'linx/mixins/models/mix-event';

export default ArrangementItem.extend(MixEventMixin('mix'), {
  mix: DS.belongsTo('mix', { async: true }),
  isValid: Ember.computed.bool('mix.content'),

  tracks: Ember.computed.reads('mix.tracks'),
});
