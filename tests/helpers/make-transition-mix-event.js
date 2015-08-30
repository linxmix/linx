import Ember from 'ember';
import DS from 'ember-data';

import makeTransition from 'linx/tests/helpers/make-transition';
import makeTrackMixEvent from 'linx/tests/helpers/make-track-mix-event';

// creates transition-event with specifications
export default function(options = {}) {
  let { fromTrack, transition, toTrack } = makeTransition.call(this);

  let { trackMixEvent: fromTrackMixEvent } = makeTrackMixEvent.call(this, { track: fromTrack });
  let { trackMixEvent: toTrackMixEvent } = makeTrackMixEvent.call(this, { track: toTrack });

  let transitionMixEvent = this.factory.make('transition-mix-event');

  // make withDefaultModel think event has clip
  transitionMixEvent.setProperties({
    prevEvent: fromTrackMixEvent,
    nextEvent: toTrackMixEvent,
    _data: {
      _clip: 1
    }
  });

  let transitionMixClip = this.factory.make('transition-mix-clip', {
    transition: transition,
    arrangementEvent: transitionMixEvent
  });

  return {
    fromTrackMixEvent,
    toTrackMixEvent,
    transition,
    transitionMixEvent,
    transitionMixClip
  };
}
