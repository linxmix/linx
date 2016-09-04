import Ember from 'ember';
import DS from 'ember-data';

import { task } from 'ember-concurrency';
import JsMediaTags from 'npm:jsmediatags';

import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';
import ReadinessMixin from 'linx/mixins/readiness';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import AudioBinary from './track/audio-binary';

export const DEFAULT_BPM = 128.00;
export const DEFAULT_DURATION = 200; // seconds

const { get } = Ember;

export default DS.Model.extend(
  ReadinessMixin('isTrackReady'),
  DependentRelationshipMixin('audioMeta'), {

  title: DS.attr('string', { defaultValue: 'Untitled Track' }),
  artist: DS.attr('string'),
  length: DS.attr('number'),

  md5: DS.attr('string'),
  s3StreamUrl: DS.attr('string'),
  scStreamUrl: DS.attr('string'),

  soundcloudTrack: DS.belongsTo('soundcloud/track', { async: true }),

  file: null,

  createFromSoundcloudTrack(soundcloudTrack) {
    this.setProperties({
      soundcloudTrack,
      title: soundcloudTrack.get('title'),
      scStreamUrl: soundcloudTrack.get('streamUrl'),
    });

    this.get('audioBinary.analyzeAudioTask').perform();
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

  // TODO(TECHDEBT): move to service?
  isFileSaved: Ember.computed.bool('uploadFileTask.lastSuccessful'),
  uploadFileTask: task(function * () {
    const file = this.get('file');
    if (file) {
      const url = yield this.get('s3Upload.uploadFileTask').perform(file);
      this.set('s3StreamUrl', url);
      return url;
    }
  }).drop(),

  sonicApi: Ember.inject.service(),
  analyzeTask: task(function * () {
    const sonicApi = this.get('sonicApi');
    console.log('analyzeTrack', this.get('title'), this.get('audioBinary.webStreamUrl'));

    const {
      meta,
      tick_marks: tickMarks
    } = yield sonicApi.get('analyzeTempoTask').perform(this.get('audioBinary.webStreamUrl'));

    // get time of highest probablility downbeat
    const barGridTime = get(tickMarks
      .filterBy('downbeat', 'true')
      .sortBy('probability')
      .reverse(),
      'firstObject.time'
    );

    this.get('audioMeta.content').setProperties({
      barGridTime,
      tempo: parseFloat(meta.overall_tempo_straight),
      timeSignature: parseInt(meta.clicks_per_bar),
    });

    console.log('analyzeTask success', meta, tickMarks, barGridTime);

  }).restartable(),

  extractId3TagsTask: task(function * () {
    const file = this.get('file');

    const { tags } = yield new Ember.RSVP.Promise((resolve, reject) => {
      JsMediaTags.read(file, {
        onSuccess: resolve,
        onError: reject,
      });
    });

    console.log('extractId3TagsTask success', tags);

    this.setProperties({
      title: get(tags, 'title') || file.name,
      artist: get(tags, 'artist'),
    });

    const audioMeta = yield this.get('audioMeta');

    audioMeta.setProperties({
      bpm: parseFloat(get(tags, 'TBPM.data') || DEFAULT_BPM),
      keyText: get(tags, 'comment.text'),
    });

  }).restartable(),

});
