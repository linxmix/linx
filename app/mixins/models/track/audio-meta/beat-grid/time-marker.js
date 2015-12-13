import Ember from 'ember';

import TrackMarkerMixin from './marker';
import RequireAttributes from 'linx/lib/require-attributes';
import { isValidNumber } from 'linx/lib/utils';

export default Ember.Mixin.create(
  TrackMarkerMixin,
  RequireAttributes('time'), {

  time: null,

  // setting beat proxies to setting time
  beat: Ember.computed('beatGrid.beatScale', 'time', {
    get(key) {
      let beatGrid = this.get('beatGrid');
      return beatGrid && beatGrid.timeToBeat(this.get('time'));
    },

    set(key, beat) {
      let beatGrid = this.get('beatGrid');

      Ember.assert('Can only set marker beat with numeric beat', isValidNumber(beat));
      Ember.assert('Can only set marker beat with valid beatGrid', Ember.isPresent(beatGrid));

      this.set('time', beatGrid.beatToTime(beat));
      return beat;
    }
  }),

  // setting bar proxies to setting time
  bar: Ember.computed('beatGrid.barScale', 'time', {
    get(key) {
      let beatGrid = this.get('beatGrid');
      return beatGrid && beatGrid.timeToBar(this.get('time'));
    },

    set(key, bar) {
      let beatGrid = this.get('beatGrid');

      Ember.assert('Can only set marker bar with numeric bar', isValidNumber(bar));
      Ember.assert('Can only set marker bar with valid beatGrid', Ember.isPresent(beatGrid));

      this.set('time', beatGrid.barToTime(bar));
      return bar;
    }
  }),
});
