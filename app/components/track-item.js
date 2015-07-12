import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import BubbleActions from 'linx/lib/bubble-actions';

export default Ember.Component.extend(
  RequireAttributes('track'), BubbleActions('remove'), {

  classNames: ['TrackItem']
});
