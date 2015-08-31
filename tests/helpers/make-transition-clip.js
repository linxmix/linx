import Ember from 'ember';
import DS from 'ember-data';

import makeTrack from 'linx/tests/helpers/make-track';
import makeTransition from 'linx/tests/helpers/make-transition';
import makeTrackClip from 'linx/tests/helpers/make-track-clip';

// creates transition-event with specifications
export default function(options = {}) {
  let { fromTrack, transition, toTrack, fromTrackClip, toTrackClip } = options;

  if (!fromTrack) {
    fromTrack = makeTrack.call(this);
  }
  if (!toTrack) {
    toTrack = makeTrack.call(this);
  }
  if (!transition) {
    let results = makeTransition.call(this, { fromTrack, toTrack });
    transition = results.transition;
  }

  if (!fromTrackClip) {
    let results = makeTrackClip.call(this, { track: fromTrack });
    fromTrackClip = results.trackClip;
  }
  if (!toTrackClip) {
    let results = makeTrackClip.call(this, { track: toTrack });
    toTrackClip = results.trackClip;
  }

  let transitionClip = this.factory.make('transition-clip', { transition });

  transitionClip.setProperties({
    prevClip: fromTrackClip,
    nextClip: toTrackClip,
  });

  fromTrackClip.set('nextClip', transitionClip);
  toTrackClip.set('prevClip', transitionClip);

  return {
    fromTrack,
    fromTrackClip,
    toTrack,
    toTrackClip,
    transition,
    transitionClip,
  };
}
