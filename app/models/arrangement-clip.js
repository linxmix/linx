import Ember from 'ember';
import DS from 'ember-data';

import Clip from './clip';
import ReadinessMixin from 'linx/mixins/readiness';

export default Clip.extend(
  ReadinessMixin('isArrangementClipReady'), {
  // type: 'arrangement-clip',

  // implementing readiness mixin
  isArrangementClipReady: Ember.computed.reads('nestedArrangement.isReady'),

  // implementing Clip
  numBeats: Ember.computed.reads('nestedArrangement.numBeats'),

  // arrangement-clip specific
  nestedArrangement: DS.belongsTo('arrangement', { async: true, inverse: null }),
});
