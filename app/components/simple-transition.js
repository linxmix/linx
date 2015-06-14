import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import ArrangementPlayerMixin from 'linx/mixins/arrangement-player';

export default Ember.Component.extend(ArrangementPlayerMixin, 
  RequireAttributes('transition'), {

  classNames: ['SimpleTransition'],

  // params
  arrangement: Ember.computed.alias('transition.arrangement'),
  clock: null, // injected by app TODO: inject straight into player/metronome
});
