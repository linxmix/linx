import Ember from 'ember';
import DS from 'ember-data';

import makeTrack from 'linx/tests/helpers/make-track';
import makeTransition from 'linx/tests/helpers/make-transition';
import makeTrackClip from 'linx/tests/helpers/make-track-clip';

// creates transition-event with specifications
export default function(options = {}) {
  let { fromTrack, transition, toTrack, fromTrackClip, toTrackClip } = options;

  if (!fromTrack) {
    fromTrack = fromTrackClip && fromTrackClip.get('track.content') || makeTrack.call(this);
  }
  if (!toTrack) {
    toTrack = toTrackClip && toTrackClip.get('track.content') || makeTrack.call(this);
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

  let transitionClip = this.factory.make('transition-clip', { transition: transition });

  transitionClip.setProperties({
    fromClip: fromTrackClip,
    toClip: toTrackClip,
  });

  fromTrackClip.setProperties({
    nextClip: toTrackClip,
    nextTransition: transition,
    nextTransitionClip: transitionClip
  });
  toTrackClip.setProperties({
    prevClip: fromTrackClip,
    prevTransition: transition,
    prevTransitionClip: transitionClip
  });

  return {
    fromTrack,
    fromTrackClip,
    toTrack,
    toTrackClip,
    transition,
    transitionClip,
  };
}
