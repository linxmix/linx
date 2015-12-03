/* global WebAudioTestAPI:true */
/* global AudioContext:true */
import Ember from 'ember';

import {
  beforeEach,
  afterEach,
} from 'mocha';

export default function() {
  beforeEach(function() {
    WebAudioTestAPI.use();

    // stub audio context methods that test API does not provide
    AudioContext.prototype.close = Ember.K;

    // provide reference to session audioContext
    let session = this.container.lookup('service:session');
    this.audioContext = session.get('audioContext');
    this.getCurrentTime = () => { return this.audioContext.currentTime; };
  });

  afterEach(function() {
    this.audioContext.close();
    WebAudioTestAPI.unuse();
  });
}
