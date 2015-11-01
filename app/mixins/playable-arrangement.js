import Ember from 'ember';

import ReadinessMixin from 'linx/mixins/readiness';

import withDefault from 'linx/lib/computed/with-default';
import equalProps from 'linx/lib/computed/equal-props';

// Interface for playable arrangements of clips
export default Ember.Mixin.create(
  ReadinessMixin('isPlayableArrangementReady'), {

  clips: Ember.computed(() => { throw new Error('Must implement PlayableArrangement.clips'); }),

  isPlayableArrangementReady: equalProps('readyClips.length', 'clips.length'),

  readyClips: Ember.computed.filterBy('clips', 'isReady', true),
  clipSort: ['endBeat:asc'],
  sortedClips: Ember.computed.sort('clips', 'clipSort'),
  endBeat: Ember.computed.reads('sortedClips.lastObject.endBeat'),
  numBeats: withDefault('endBeat', 0),

  numBars: Ember.computed('numBeats', function() {
    return this.get('numBeats') / 4.0;
  }),
});
