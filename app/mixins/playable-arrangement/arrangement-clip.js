import Ember from 'ember';

import ClipMixin from './clip';
import ReadinessMixin from '../readiness';

export default Ember.Mixin.create(
  ClipMixin,
  ReadinessMixin('isArrangementClipReady'), {

  // implementing readiness mixin
  isArrangementClipReady: Ember.computed.reads('nestedArrangement.isReady'),

  // implement playable-clip
  componentName: 'arrangement-grid/arrangement-clip',
  beatCount: Ember.computed.reads('nestedArrangement.beatCount'),
});
