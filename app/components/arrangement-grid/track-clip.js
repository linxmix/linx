import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttributes('clip'), {

  classNames: ['TrackClip'],

  // params
  track: Ember.computed.reads('clip.track'),
  audioStartBeat: Ember.computed.reads('clip.audioStartBeat'),
  audioEndBeat: Ember.computed.reads('clip.audioEndBeat'),
  audioMeta: Ember.computed.reads('track.audioMeta'),

  markers: Ember.computed.reads('audioMeta.markers'),
  visibleMarkers: Ember.computed('audioStartBeat', 'audioEndBeat', 'markers.@each.beat', function() {
    let audioStartBeat = this.get('audioStartBeat');
    let audioEndBeat = this.get('audioEndBeat');

    return this.getWithDefault('markers', []).filter((marker) => {
      let markerStartBeat = marker.get('beat');
      return markerStartBeat >= audioStartBeat && markerStartBeat <= audioEndBeat;
    });
  }),
});
