import Ember from 'ember';
import DS from 'ember-data';

import { flatten, timeToBeat } from 'linx/lib/utils';
import { BEAT_MARKER_TYPE, BAR_MARKER_TYPE, SECTION_MARKER_TYPE } from './marker';

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  length: DS.attr('number'),

  md5: DS.attr('string'),
  s3Url: DS.attr('string'),

  _echonestTrack: DS.belongsTo('echonest-track', { async: true }),

  // injected by app
  echonest: null,

  // analysis params
  isAnalyzed: DS.attr('boolean', { defaultValue: false }),
  duration: DS.attr('number'),
  bpm: DS.attr('number'),
  timeSignature: DS.attr('number'),
  key: DS.attr('number'),
  mode: DS.attr('number'),
  loudness: DS.attr('number'),

  markers: DS.hasMany('marker', { async: true }),
  sortedMarkers: Ember.computed.alias('markers'),

  sortedBeatMarkers: Ember.computed.filterBy('sortedMarkers', 'type', BEAT_MARKER_TYPE),
  sortedBarMarkers: Ember.computed.filterBy('sortedMarkers', 'type', BAR_MARKER_TYPE),
  sortedSectionMarkers: Ember.computed.filterBy('sortedMarkers', 'type', SECTION_MARKER_TYPE),

  firstBeatMarker: Ember.computed.alias('sortedBeatMarkers.firstObject'),

  streamUrl: Ember.computed.any('s3StreamUrl', 'scStreamUrl'),

  s3StreamUrl: function() {
    if (!Ember.isNone(this.get('s3Url'))) {
      // TODO: move to config
      return "http://s3-us-west-2.amazonaws.com/linx-music/" + this.get('s3Url');
    }
  }.property('s3Url'),

  // TODO
  scStreamUrl: function() {
    return null;
  }.property(),

  // TODO: fill out with identify linx md5 tracks, dedupe, etc
  identify: function() {
  },

  // if we have not yet identified this track in echonest, upload and return promise object
  // otherwise, load the relationship as normal
  echonestTrack: function() {
    var echonestTrackId = this.get('_data._echonestTrack');

    if (!this.get('isLoaded') || echonestTrackId) {
      return this.get('_echonestTrack');
    } else {
      return this.fetchEchonestTrack();
    }
  }.property('isLoaded', '_echonestTrack'),

  fetchEchonestTrack: function() {
    var promiseObject = this.get('echonest').fetchTrack(this);

    promiseObject.then((echonestTrack) => {
      this.set('_echonestTrack', echonestTrack);
      this.save();
    });

    return promiseObject;
  },

  // analyzes the track for core audio data. returns a promise.
  // caches by default, can optionally force re-analysis to clear cached data

  // TODO: make declarative... make analysis a model?
  analyze: function(forceAnalysis) {
    if (!forceAnalysis && this.get('isAnalyzed')) {
      return new Ember.RSVP.Promise((resolve, reject) => { resolve(); });
    }

    else {
      var store = this.get('store');

      return this.get('echonestTrack').then((echonestTrack) => {
        return echonestTrack.get('analysis').then((analysis) => {
          var bpm = echonestTrack.get('bpm');

          var beatMarkers = [store.createRecord('marker', {
            type: BEAT_MARKER_TYPE,
            start: echonestTrack.get('firstBeatStart'),
            track: this,
          })];

          var barMarkers = echonestTrack.get('confidentBars').map((bar) => {
            return store.createRecord('marker', {
              type: BAR_MARKER_TYPE,
              start: bar.get('start'),
              track: this,
            });
          });

          var sectionMarkers = echonestTrack.get('confidentSections').map((section) => {
            return store.createRecord('marker', {
              type: SECTION_MARKER_TYPE,
              start: section.get('start'),
              track: this,
            });
          });

          // save all markers, then set properties and save track
          var markers = flatten([beatMarkers, barMarkers, sectionMarkers]);
          var markerSavePromises = markers.map((marker) => { return marker.save(); });

          return Ember.RSVP.all(markerSavePromises).then(() => {
            return this.get('markers').then(() => {
              // TODO: delete old beat/bar markers
              this.get('markers').pushObjects(markers);

              this.setProperties({
                isAnalyzed: true,
                duration: echonestTrack.get('duration'),
                bpm: bpm,
                timeSignature: echonestTrack.get('timeSignature'),
                key: echonestTrack.get('key'),
                mode: echonestTrack.get('mode'),
                loudness: echonestTrack.get('loudness'),
              });

              return this.save();
            });
          });

        });
      });
    }
  },

});
