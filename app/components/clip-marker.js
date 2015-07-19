import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';
import withDefault from 'linx/lib/with-default';

import {
  BEAT_MARKER_TYPE,
  BAR_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from './marker';

export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('marker', 'pxPerBeat'), {

  actions: {},
  classNames: ['ClipMarker'],
  classNameBindings: [],
  attributeBindings: ['componentStyle:style'],

  componentStyle: cssStyle({
    'left': 'startPx',
    'background-color': 'color'
  }),

  color: Ember.computed.any('marker.color', 'typeColor'),
  typeColor: function() {
    switch (this.get('model.type')) {
      case BEAT_MARKER_TYPE: return 'rgba(0,1,1,0.5)';
      case BAR_MARKER_TYPE: return 'rgba(1,0,0,0.5)';
      case SECTION_MARKER_TYPE: return 'rgba(0,1,0,0.5)';
      case FADE_IN_MARKER_TYPE: case FADE_OUT_MARKER_TYPE: return 'rgba(1,1,0,0.5)';
    }
  }.property('model.type'),

  startPx: function() {
    return (this.get('marker.startBeat') * this.get('pxPerBeat')) + 'px';
  }.property('marker.startBeat', 'pxPerBeat'),
});

