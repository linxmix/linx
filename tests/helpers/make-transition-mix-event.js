import Ember from 'ember';
import DS from 'ember-data';

import makeTransition from 'linx/tests/helpers/make-transition';
import makeTrackMixEvent from 'linx/tests/helpers/make-track-mix-event';

// creates transition-event with specifications
export default function(options = {}) {
  let { fromTrack, transition, toTrack } = makeTransition.call(this);

  let {
    trackMixEvent: fromTrackMixEvent,
    trackMixClip: fromTrackMixClip,
  } = makeTrackMixEvent.call(this, { track: fromTrack });

  let {
    trackMixEvent: toTrackMixEvent,
    trackMixClip: toTrackMixClip,
  } = makeTrackMixEvent.call(this, { track: toTrack });

  let transitionMixEvent = this.factory.make('transition-mix-event');

  transitionMixEvent.setProperties({
    prevEvent: fromTrackMixEvent,
    nextEvent: toTrackMixEvent,
    // make withDefaultModel think event has clip
    _data: {
      _clip: 1
    }
  });

  fromTrackMixEvent.set('nextEvent', transitionMixEvent);
  toTrackMixEvent.set('prevEvent', transitionMixEvent);

  let transitionMixClip = this.factory.make('transition-mix-clip', {
    transition: transition,
    arrangementEvent: transitionMixEvent
  });

  return {
    fromTrack,
    fromTrackMixEvent,
    fromTrackMixClip,
    toTrack,
    toTrackMixEvent,
    toTrackMixClip,
    transition,
    transitionMixEvent,
    transitionMixClip
  };
}
