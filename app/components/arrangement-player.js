import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import Sequencer from 'linx/lib/sequencer';

export default Ember.Component.extend(
  RequireAttributes('arrangement'), {

  classNames: ['ArrangementPlayer'],

  actions: {
    playpause: function() {
      this.get('sequencer').playpause();
    },

    skipBack: function() {
      console.log("skip back unimplemented");
    },

    skipForth: function() {
      console.log("skip forth unimplemented");
    },
  },

  // injected by app
  // TODO: inject clock straight into metronome
  clock: null,

  // params
  isPlaying: Ember.computed.alias('sequencer.isPlaying'),
  sequencer: Ember.computed(function() {
    return Sequencer.create({
      player: this,
    });
  }),

});
