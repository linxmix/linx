import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import ArrangementPlayerMixin from 'linx/mixins/arrangement-player';

export default Ember.Component.extend(ArrangementPlayerMixin,
  RequireAttributes('arrangement'), {

  actions: {
    toggleEditing: function() {
      this.toggleProperty('isEditing');
    }
  },

  isEditing: false,

  // Hacky stuff to convert <input type="number"> values to numbers
  inputBpm: Ember.computed.oneWay('metronome.bpm'),
  inputZoom: Ember.computed.oneWay('pxPerBeat'),
  _inputBpmDidChange: function() {
    this.get('metronome').setBpm(parseFloat(this.get('inputBpm')));
  }.observes('inputBpm'),
  _inputZoomDidChange: function() {
    this.set('pxPerBeat', parseFloat(this.get('inputZoom')));
  }.observes('inputZoom'),
  // /hacky stuff

  classNames: ['SimpleArrangement'],

});
