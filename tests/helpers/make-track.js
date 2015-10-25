import Ember from 'ember';
import DS from 'ember-data';

import makeAudioMeta from './make-audio-meta';

// creates track with specifications
export default function(options = {}) {
  let audioMeta = Ember.getWithDefault(options, 'audioMeta', makeAudioMeta.call(this, options));

  let track = this.factory.make('track', {
    _audioMeta: audioMeta
  });

  return track;
}
