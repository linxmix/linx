import Ember from 'ember';
import DS from 'ember-data';

import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';
import ReadinessMixin from 'linx/mixins/readiness';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import AudioBinary from './track/audio-binary';

export const DEFAULT_BPM = 128.00;
export const DEFAULT_DURATION = 200; // seconds

export default DS.Model.extend(
  ReadinessMixin('isTrackReady'),
  DependentRelationshipMixin('audioMeta'), {

  title: DS.attr('string'),
  artist: DS.attr('string'),
  length: DS.attr('number'),

  md5: DS.attr('string'),
  s3StreamUrl: DS.attr('string'),
  scStreamUrl: DS.attr('string'),

  soundcloudTrack: DS.belongsTo('soundcloud/track', { async: true }),

  createFromSoundcloudTrack(soundcloudTrack) {
    this.setProperties({
      soundcloudTrack,
      title: soundcloudTrack.get('title'),
      scStreamUrl: soundcloudTrack.get('streamUrl'),
    });
  },

  _audioMeta: DS.belongsTo('track/audio-meta', { async: true }),
  audioMeta: withDefaultModel('_audioMeta', function() {
    return this.get('store').createRecord('track/audio-meta', {
      track: this,

      // TODO: calculate these
      bpm: DEFAULT_BPM,
      duration: DEFAULT_DURATION,
    });
  }),

  audioBinary: Ember.computed(function() {
    return AudioBinary.create({
      track: this,
    });
  }),

  // injected by app
  session: Ember.inject.service(),

  // implement readiness
  isTrackReady: Ember.computed.reads('audioMeta.isReady'),
});
