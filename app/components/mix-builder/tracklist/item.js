import Ember from 'ember';

import _ from 'npm:underscore';

import add from 'linx/lib/computed/add';
import equalProps from 'linx/lib/computed/equal-props';
import { FROM_TRACK_COLOR, TO_TRACK_COLOR } from 'linx/components/mix-builder';

export default Ember.Component.extend({
  tagName: 'tr',
  classNames: ['MixBuilderTracklistItem'],
  classNameBindings: [
    'isSelectedFromTrack:MixBuilderTracklistItem--selectedFromTrack',
    'isSelectedToTrack:MixBuilderTracklistItem--selectedToTrack',
  ],

  // required params
  item: null,

  // optional params
  selectedTransition: null,

  actions: {
    selectTransition() {
      this.sendAction('selectTransition', this.get('transition'));
    },

    playItem() {
      this.sendAction('playItem', this.get('item'));
    },

    removeItem() {
      this.sendAction('removeItem', this.get('item'));
    },

    updateItemPosition(delta) {
      this.sendAction('moveItem', this.get('item'), this.get('item.index') + delta);
    }
  },

  updateTrackBpm: _.throttle(function(newBpm) {
    newBpm = parseFloat(newBpm);

    this.set('track.audioMeta.bpm', newBpm);
  }, 1000, { leading: false }),

  // CURRENTLY DISABLED so mix save button controls everything
  // TODO(TECHDEBT): update to ember concurrency. should be in container
  // _autoSaveTrack: Ember.observer('track.{title,artist}', 'track.audioMeta.{gain,bpm,transpose}', _.throttle(function() {
  //   const track = this.get('track.content');
  //   const item = this.get('item');

  //   if (track && track.get('anyDirty') && !item.get('isNew') && !track.get('isSaving')) {
  //     console.log('Autosave Track', this.get('track.title'));
  //     track.save();
  //   }
  // }, 1000)),

  // params
  transition: Ember.computed.reads('item.transition'),
  track: Ember.computed.reads('item.track'),
  mix: Ember.computed.reads('item.mix'),

  isSelectedTransition: equalProps('selectedTransition.id', 'transition.id'),
  isSelectedFromTrack: Ember.computed.reads('isSelectedTransition'),
  isSelectedToTrack: equalProps('selectedTransition.id', 'item.prevTransition.id'),

  isLastItem: equalProps('item.position', 'mix.length'),
});

