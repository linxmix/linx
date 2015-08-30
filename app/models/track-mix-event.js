import Ember from 'ember';
import DS from 'ember-data';

import ArrangementEvent from './arrangement-event';
import MixEventMixin from 'linx/mixins/models/mix-event';

export default ArrangementEvent.extend(MixEventMixin('track'), {
  track: Ember.computed.reads('clip.model'),
  isValid: Ember.computed.bool('track.content'),

  tracks: function() {
    return [this.get('track')];
  }.property('track'),
});
