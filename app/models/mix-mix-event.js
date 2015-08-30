import Ember from 'ember';
import DS from 'ember-data';

import ArrangementItem from './arrangement-item';
import MixEventMixin from 'linx/mixins/models/mix-event';

export default ArrangementItem.extend(MixEventMixin('mix'), {
  nestedMix: Ember.computed.reads('clip.mix'),
  isValid: Ember.computed.bool('nestedMix.content'),

  tracks: Ember.computed.reads('nestedMix.tracks'),
});
