import Ember from 'ember';
import DS from 'ember-data';

import Clip from './clip';
import TrackClipMixin from 'linx/mixins/playable-arrangement/track-clip';
import { withDefaultProperty } from 'linx/lib/computed/with-default';

export default Clip.extend(
  TrackClipMixin, {

  // TODO(REFACTOR): how to figure out defaults? withDefaultProperty?
  startBeat: DS.attr('number', { defaultValue: 0 }),
  audioStartBeat: DS.attr('number'),
  audioEndBeat: DS.attr('number'),

  track: DS.belongsTo('track', { async: true }),
});
