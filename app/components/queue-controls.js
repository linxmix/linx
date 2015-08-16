import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import ArrangementPlayerMixin from 'linx/mixins/arrangement-player';

export default Ember.Component.extend(
  ArrangementPlayerMixin,
  BubbleActions(), RequireAttributes(), {

  classNames: 'QueueControls',
  classNameBindings: [],

  // params
  queue: Ember.inject.service(),
  mix: Ember.computed.alias('queue.mix'),
  arrangement: Ember.computed.alias('mix.arrangement'),
});
