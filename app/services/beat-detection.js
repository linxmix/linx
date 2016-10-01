import Ember from 'ember';

import { task } from 'ember-concurrency';

const SAMPLE_RATE = 44100;
const SECONDS_TO_ANALYZE = 60;

export default Ember.Service.extend({
  analyzeTrackTask: task(function * (track) {
    console.log('analyze track', track && track.get('title'));
    Ember.assert('Must provide track to BeatDetection#analyzeTrack', !!track);

    const audioBuffer = yield track.get('audioBinary.decodedArrayBuffer');

    if (!audioBuffer) { return; }

    const peaks = yield _getFilteredPeaks(audioBuffer);
    const intervals = _getIntervals(peaks);
    const topIntervals = intervals.splice(0, 5);

    // return peaks with time [s], volume
    return {
      peaks: peaks.map(({ position, volume }) => {
        return {
          time: position / SAMPLE_RATE,
          volume,
        };
      }),
      intervals
    };
  }),
});


// computed a filtered version of audioBuffer
// adapted from https://github.com/JMPerez/beats-audio-api
function _getFilteredPeaks(audioBuffer) {
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const offlineContext =  new OfflineContext(2, SECONDS_TO_ANALYZE * SAMPLE_RATE, SAMPLE_RATE);

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  // Beats, or kicks, generally occur around the 100 to 150 hz range.
  // Below this is often the bassline.  So let's focus just on that.

  // First a lowpass to remove most of the song.

  const lowpass = offlineContext.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 150;
  lowpass.Q.value = 1;

  // Run the output of the source through the low pass.

  source.connect(lowpass);

  // Now a highpass to remove the bassline.

  const highpass = offlineContext.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 100;
  highpass.Q.value = 1;

  // Run the output of the lowpass through the highpass.

  lowpass.connect(highpass);

  // Run the output of the highpass through our offline context.

  highpass.connect(offlineContext.destination);

  // Start the source, and render the output into the offline conext.

  source.start(0);
  return offlineContext.startRendering().then((filteredBuffer) => {
    return _getPeaks([filteredBuffer.getChannelData(0), filteredBuffer.getChannelData(1)]);
  });
}

//
// _getPeaks and _getIntervals sourced from https://github.com/JMPerez/beats-audio-api
//
function _getPeaks(data) {

  // What we're going to do here, is to divide up our audio into parts.

  // We will then identify, for each part, what the loudest sample is in that
  // part.

  // It's implied that that sample would represent the most likely 'beat'
  // within that part.

  // Each part is 0.5 seconds long - or 22,050 samples.

  // This will give us 60 'beats' - we will only take the loudest half of
  // those.

  // This will allow us to ignore breaks, and allow us to address tracks with
  // a BPM below 120.

  var partSize = SAMPLE_RATE / 2,
      parts = data[0].length / partSize,
      peaks = [];

  for (var i = 0; i < parts; i++) {
    var max = 0;
    for (var j = i * partSize; j < (i + 1) * partSize; j++) {
      var volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
      if (!max || (volume > max.volume)) {
        max = {
          position: j,
          volume: volume
        };
      }
    }
    peaks.push(max);
  }

  // We then sort the peaks according to volume...

  peaks.sort(function(a, b) {
    return b.volume - a.volume;
  });

  // ...take the loundest half of those...

  peaks = peaks.splice(0, peaks.length * 0.5);

  // ...and re-sort it back based on position.

  peaks.sort(function(a, b) {
    return a.position - b.position;
  });

  return peaks;
}

function _getIntervals(peaks) {

  // What we now do is get all of our peaks, and then measure the distance to
  // other peaks, to create intervals.  Then based on the distance between
  // those peaks (the distance of the intervals) we can calculate the BPM of
  // that particular interval.

  // The interval that is seen the most should have the BPM that corresponds
  // to the track itself.

  var groups = [];

  peaks.forEach(function(peak, index) {
    for (var i = 1; (index + i) < peaks.length && i < 10; i++) {
      var group = {
        tempo: (60 * SAMPLE_RATE) / (peaks[index + i].position - peak.position),
        count: 1
      };

      while (group.tempo < 90) {
        group.tempo *= 2;
      }

      while (group.tempo > 180) {
        group.tempo /= 2;
      }

      group.tempo = Math.round(group.tempo);

      if (!(groups.some(function(interval) {
        return (interval.tempo === group.tempo ? interval.count++ : 0);
      }))) {
        groups.push(group);
      }
    }
  });
  return groups.sort((intA, intB) => {
    return intB.count - intA.count;
  });
}
