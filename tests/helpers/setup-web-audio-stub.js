/* global WebAudioTestAPI:true */
/* global AudioContext:true */

import {
  beforeEach,
  afterEach,
} from 'mocha';

export default function() {
  beforeEach(function() {
    WebAudioTestAPI.use();
    this.audioContext = new AudioContext();
    this.getCurrentTime = () => { return this.audioContext.currentTime; };
  });

  afterEach(function() {
    WebAudioTestAPI.unuse();
    // this.audioContext.close();
  });
}
