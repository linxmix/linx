import Ember from 'ember';

import _ from 'npm:underscore';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import ArrangementPlayerMixin from 'linx/mixins/components/arrangement-player';
import ArrangementVisualMixin from 'linx/mixins/components/arrangement-visual';

export const MIX_ITEM_PREVIEW_DISTANCE = 4;

export default Ember.Component.extend(
  ArrangementPlayerMixin,
  ArrangementVisualMixin,
  BubbleActions('saveMix', 'deleteMix'), RequireAttributes('mix', 'store'), {

  classNames: ['SimpleMix'],
  classNameBindings: [],

  actions: {
    resetMix() {
      // TODO: dependentRelationship.rollbackAttributes
      // TODO: orderedHasMany.rollbackAttributes
      this.get('mix').rollbackAttributes();
    },

    playItem(mixItem) {
      this.send('viewItem', mixItem);

      mixItem.get('transitionClip.readyPromise').then((clip) => {
        this.send('play', clip.get('startBeat') - MIX_ITEM_PREVIEW_DISTANCE);
      });
    },

    viewItem(mixItem) {
      mixItem.get('transitionClip.readyPromise').then((clip) => {
        this.send('zoomToClip', clip);
      });
    },

    removeItem(mixItem) {
      const mix = this.get('mix');
      mix.removeObject(mixItem);
    },

    selectTrack(track) {
      const mix = this.get('mix');

      mix.generateTransitionAndAppend({
        toTrack: track
      });
    },

    appendRandomTrack() {
      const mix = this.get('mix');
      const tracks = this.get('searchTracks.content');
      const randomTrack = _.sample(tracks.toArray());

      mix.generateTransitionAndAppend({
        toTrack: randomTrack
      });
    },

    onTransitionClipClick(clip) {
      this.sendAction('transitionToTransition', clip.get('transition'));
    }
  },

  // implement ArrangementPlayerMixin
  arrangement: Ember.computed.reads('mix'),

  searchTracks: Ember.computed(function() {
    return this.get('store').findAll('track');
  }),

  // Hacky stuff to convert <input type="number"> values to numbers
  inputBpm: Ember.computed.oneWay('metronome.bpm'),
  inputZoom: Ember.computed.oneWay('pxPerBeat'),
  _inputBpmDidChange: function() {
    this.get('metronome').setBpm(parseFloat(this.get('inputBpm')));
  }.observes('inputBpm'),
  _inputZoomDidChange: function() {
    // update pxPerBeat
    this.set('pxPerBeat', parseFloat(this.get('inputZoom')));
  }.observes('inputZoom'),
  // /hacky stuff
});

