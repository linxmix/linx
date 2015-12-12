import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import ClipMixin from './clip';
import ReadinessMixin from '../readiness';

export default Ember.Mixin.create(
  ClipMixin,
  // TODO(REFACTOR)
  // RequireAttributes('nestedArrangement'),
  ReadinessMixin('isArrangementClipReady'), {

  // implementing readiness mixin
  isArrangementClipReady: Ember.computed.reads('nestedArrangement.isReady'),

  // implement playable-clip
  componentName: 'arrangement-grid/arrangement-clip',
  beatCount: Ember.computed.reads('nestedArrangement.beatCount'),
});
