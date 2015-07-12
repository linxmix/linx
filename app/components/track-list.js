import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('trackList'), {

  actions: {},
  classNames: ['TrackList', 'inverted ui selection list'],
  classNameBindings: [],

  // params
  foo: 'bar',
});

