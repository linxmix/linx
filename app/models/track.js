import Ember from 'ember';
import DS from 'ember-data';

import { task } from 'ember-concurrency';
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

  file: DS.attr(),

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
  s3Upload: Ember.inject.service(),

  // implement readiness
  isTrackReady: Ember.computed.reads('audioMeta.isReady'),

  // upload file when saving
  save() {
    const file = this.get('file');
    const isFileSaved = this.get('isFileSaved');

    if (file && !isFileSaved) {
      const uploadFileTask = this.get('uploadFileTask');
      const promise = uploadFileTask.get('last') || uploadFileTask.perform();
      return promise.then(() => this.save());
    } else {
      return this._super.apply(this, arguments);
    }
  },

  destroyRecord() {
    this.get('uploadFileTask').cancel();
    return this._super.apply(this, arguments);
  },

  isFileSaved: Ember.computed.bool('uploadFileTask.lastSuccessful'),

  // TODO(TECHDEBT): move to service?
  uploadFileTask: task(function * () {
    const file = this.get('file');
    if (file) {
      const url = yield this.get('s3Upload.uploadFileTask').perform(file);
      this.set('s3StreamUrl', url);
      return url;
    }
  }).drop(),
});
