import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import ArrangementPlayerMixin from 'linx/mixins/arrangement-player';

export default Ember.Component.extend(
  ArrangementPlayerMixin,
  BubbleActions(), RequireAttributes('mix'), {

  classNames: ['SimpleMix'],
  classNameBindings: [],

  actions: {
    seekToBeat(beat) {
      // TODO: round to beat, round to bar, no round. based on config + UI control
      this.get('metronome').seekToBeat(beat);
      // this.set('scrollCenterBeat', beat);
    }
  },

  // implement ArrangementPlayerMixin
  arrangement: Ember.computed.reads('mix'),

  // params
  scrollCenterBeat: 0,

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

