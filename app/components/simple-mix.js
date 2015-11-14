import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import ArrangementPlayerMixin from 'linx/mixins/arrangement-player';

const MIX_ITEM_PREVIEW_DISTANCE = 4;

export default Ember.Component.extend(
  ArrangementPlayerMixin,
  BubbleActions('saveMix', 'deleteMix'), RequireAttributes('mix', 'store'), {

  classNames: ['SimpleMix'],
  classNameBindings: [],

  // optional params
  scrollCenterBeat: 0,

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
        this.set('scrollCenterBeat', clip.get('centerBeat'));
      });
    },

    removeItem(mixItem) {
      let mix = this.get('mix');
      mix.removeObject(mixItem);
    },

    selectTrack(track) {
      let mix = this.get('mix');

      mix.generateAndAppendTransition({
        toTrack: track
      });
    },

    addRandomTrack() {
      let mix = this.get('mix');
      let tracks = this.get('searchTracks.content');
      let randomTrack = _.sample(tracks.toArray());

      mix.generateAndAppendTransition({
        toTrack: randomTrack
      });
    },
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

