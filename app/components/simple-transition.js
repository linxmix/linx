import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import ArrangementPlayerMixin from 'linx/mixins/arrangement-player';

export default Ember.Component.extend(ArrangementPlayerMixin,
  RequireAttributes('transition'), {

  // Hacky stuff to convert <input type="number"> values to numbers
  inputBpm: Ember.computed.oneWay('metronome.bpm'),
  inputZoom: Ember.computed.oneWay('pxPerBeat'),
  _inputBpmDidChange: function() {
    this.set('metronome.bpm', parseFloat(this.get('inputBpm')));
  }.observes('inputBpm'),
  _inputZoomDidChange: function() {
    this.set('pxPerBeat', parseFloat(this.get('inputZoom')));
  }.observes('inputZoom'),
  // /hacky stuff

  classNames: ['SimpleTransition'],

  // params
  arrangement: Ember.computed.alias('transition.arrangement'),
});
