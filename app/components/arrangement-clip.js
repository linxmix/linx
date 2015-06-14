import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttributes('model', 'metronome'), {

  classNames: ['ArrangementClip'],
});
