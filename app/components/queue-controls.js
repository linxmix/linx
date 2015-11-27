import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import ArrangementPlayerMixin from 'linx/mixins/components/arrangement-player';

export default Ember.Component.extend(
  ArrangementPlayerMixin,
  BubbleActions(), RequireAttributes(), {

  classNames: 'QueueControls',
  classNameBindings: [],

  // params
  session: Ember.inject.service(),
  queue: Ember.computed.alias('session.queue'),
  arrangement: Ember.computed.alias('queue.arrangement'),
});
