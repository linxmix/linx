import Ember from 'ember';

import TrackMarkerMixin from './marker';
import RequireAttributes from 'linx/lib/require-attributes';
import { isValidNumber } from 'linx/lib/utils';

export default Ember.Mixin.create(
  TrackMarkerMixin,
  RequireAttributes('beat'), {

  beat: null,

  // setting time proxies to setting beat
  time: Ember.computed('beatGrid.beatScale', 'beat', {
    get(key) {
      let beatGrid = this.get('beatGrid');
      return beatGrid && beatGrid.beatToTime(this.get('beat'));
    },

    set(key, time) {
      let beatGrid = this.get('beatGrid');

      Ember.assert('Can only set marker time with numeric time', isValidNumber(time));
      Ember.assert('Can only set marker time with valid beatGrid', Ember.isPresent(beatGrid));

      this.set('beat', beatGrid.timeToBeat(time));
      return time;
    }
  }),

  // setting bar proxies to setting beat
  bar: Ember.computed('beatGrid.barScale', 'beat', {
    get(key) {
      let beatGrid = this.get('beatGrid');
      return beatGrid && beatGrid.beatToBar(this.get('beat'));
    },

    set(key, bar) {
      let beatGrid = this.get('beatGrid');

      Ember.assert('Can only set marker bar with numeric bar', isValidNumber(bar));
      Ember.assert('Can only set marker bar with valid beatGrid', Ember.isPresent(beatGrid));

      this.set('bar', beatGrid.barToBeat(bar));
      return bar;
    }
  }),
});
