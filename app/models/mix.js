import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';
import d3 from 'd3';

import CrudMixin from 'linx/mixins/models/crud';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';
import PlayableArrangementMixin from 'linx/mixins/playable-arrangement';
import { flatten, isValidNumber } from 'linx/lib/utils';

export default DS.Model.extend(
  CrudMixin,
  PlayableArrangementMixin,
  new OrderedHasManyMixin('_mixItems'), {

  // implement ordered has many
  orderedHasManyItemModelName: 'mix/item',
  _mixItems: DS.hasMany('mix/item', { async: true }),

  title: DS.attr('string'),
  timeSignature: DS.attr('number', { defaultValue: 4.0 }),

  // DEPRECATED, from pre-multigrid
  bpm: DS.attr('number', { defaultValue: 128 }),

  // implement playable-arrangement
  session: Ember.inject.service(),
  audioContext: Ember.computed.reads('session.audioContext'),
  bpmControlPoints: Ember.computed('bpm',
    '_transitionBpmControlPoints.@each.{beat,value,transitionStartBeat}', function() {
    const bpmControlPoints = this.get('_transitionBpmControlPoints');

    // if we dont have any bpm control points, fake it with base mix bpm
    if (Ember.isEmpty(bpmControlPoints)) {
      const mixBpm = this.get('bpm');

      // because the bpmScale is clamped, this sets a constant bpm
      return [
        {
          beat: 0,
          value: mixBpm,
        },
      ];
    } else {
      return bpmControlPoints.map((controlPoint) => {
        // offset control point by transitionClip startBeat
        const transitionStartBeat = controlPoint.get('transitionStartBeat');
        const beat = isValidNumber(transitionStartBeat) ?
          controlPoint.get('beat') + transitionStartBeat : controlPoint.get('beat');

        return {
          beat,
          value: controlPoint.get('value'),
        };
      });
    }
  }),

  tracks: Ember.computed.mapBy('items', 'track'),
  transitions: Ember.computed.mapBy('items', 'transition'),

  trackClips: Ember.computed.mapBy('items', 'trackClip'),
  transitionClips: Ember.computed.mapBy('items', 'transitionClip'),
  clips: Ember.computed.uniq('trackClips', 'transitionClips'),

  _transitionBpmControlPoints: Ember.computed('transitions.@each.bpmControlPoints', function() {
    return flatten(this.get('transitions').without(undefined).mapBy('bpmControlPoints')).without(undefined);
  }),

  trackAt(index) {
    const item = this.objectAt(index);
    return item && item.get('track.content');
  },

  insertTrackAt(index, track) {
    const item = this.createAt(index);

    return item.setTrack(track).then(() => {
      return item.get('trackClip').then((trackClip) => {
        // TODO(TECHDEBT): why does clip observer not work without this line?
        trackClip.set('metronome', this.get('metronome'));
        return item;
      });
    });
  },

  insertTracksAt(index, tracks) {
    const items = tracks.map((track) => {
      const item = this.createItem();
      return item.setTrack(track);
    });

    return Ember.RSVP.all(items).then((items) => {
      return this.replace(index, 0, items);
    });
  },

  appendTrack(track) {
    return this.insertTrackAt(this.get('length'), track);
  },

  appendTracks(tracks) {
    return this.insertTracksAt(this.get('length'), tracks);
  },
});
