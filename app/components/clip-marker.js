import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';
import withDefault from 'linx/lib/computed/with-default';

import {
  GRID_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from 'linx/models/marker';

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

  color: Ember.computed.or('marker.color', 'typeColor'),
  typeColor: function() {
    switch (this.get('marker.type')) {
      case GRID_MARKER_TYPE: return 'rgba(0,255,255,0.5)';
      case USER_MARKER_TYPE: return 'rgba(255,0,0,0.5)';
      case SECTION_MARKER_TYPE: return 'rgba(0,255,0,0.5)';
      case FADE_IN_MARKER_TYPE: case FADE_OUT_MARKER_TYPE: return 'rgba(255,255,0,0.5)';
    }
  }.property('marker.type'),

  startPx: function() {
    return (this.get('marker.startBeat') * this.get('pxPerBeat')) + 'px';
  }.property('marker.startBeat', 'pxPerBeat'),
});

