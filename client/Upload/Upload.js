Session.setDefault("uploadStep", 1);

Template.Upload.created = function() {
  this.startSong = Object.create(WaveSurfer);
  this.transition = Object.create(WaveSurfer);
  this.endSong = Object.create(WaveSurfer);
};

function getActiveWaves(template) {
  switch (Session.get('uploadStep')) {
    case 1: return [template.transition];
    case 2: return [template.transition, template.startSong];
    case 3: return [template.transition, template.endSong];
  }
}

function wavesAreLoaded(template) {
  return getActiveWaves(template).reduce(function(allAnalyzed, wave) {
    return allAnalyzed && wave.isLoaded();
  }, true);
}

function wavesAreAnalyzed(template) {
  return getActiveWaves(template).reduce(function(allAnalyzed, wave) {
    return allAnalyzed && wave.isAnalyzed();
  }, true);
}


function regionsAreSelected(template) {
  return getActiveWaves(template).reduce(function(allAnalyzed, wave) {
    return allAnalyzed && wave.hasSelectedRegion();
  }, true);
}

Template.Upload.helpers({
  startSongHidden: function() {
    var step = Session.get('uploadStep');
    return step === 2 ? '' : 'hidden';
  },

  endSongHidden: function() {
    var step = Session.get('uploadStep');
    return step === 3 ? '' : 'hidden';
  },

  showCompareButton: function() {
    return !Session.equals('uploadStep', 1);
  },

  compareButtonClass: function() {
    var template = Template.instance();
    if (!wavesAreLoaded(template)) {
      return 'disabled';
    } else if (!wavesAreAnalyzed(template)) {
      return 'purple analyze';
    } else if (!regionsAreSelected(template)) {
      return 'disabled';
    } else {
      return 'compare';
    }
  },

  compareButtonIcon: function() {
    var template = Template.instance();
    if (!wavesAreLoaded(template)) {
      return 'pointing down icon';
    } else if (!wavesAreAnalyzed(template)) {
      return 'file audio outline icon';
    } else if (!regionsAreSelected(template)) {
      return 'pointing down icon';
    } else {
      return 'exchange icon';
    }
  },

  compareButtonText: function() {
    var template = Template.instance();
    if (!wavesAreLoaded(template)) {
      return 'Select Tracks';
    } else if (!wavesAreAnalyzed(template)) {
      return 'Analyze';
    } else if (!regionsAreSelected(template)) {
      return 'Select Regions';
    } else {
      return 'Compare';
    }
  },

  startSong: function() {
    return Template.instance().startSong;
  },

  transition: function() {
    return Template.instance().transition;
  },

  endSong: function() {
    return Template.instance().endSong;
  },

});

Template.Upload.events({
  'click .compare-button.analyze': function(e) {
    // TODO
    console.log("click analyze", getActiveWaves(this));
  },

  'click .compare-button.compare': function(e) {
    // TODO
    console.log("click compare", getActiveWaves(this));
  },
});

// find offset of waves
function computeWaveMatch(startWave, endWave) {
  console.log("computeWaveMatch");

  // TODO: determine sample size by array size, iterate
  var sampleSize = 100;
  var numMatches = 1;
  var sampleRegion1, sampleRegion2;

  // iterate cross-correlation with 'zooming in' and increasing sample resolution to find accurate match data
  var samples1, samples2, matchData, offsetIndex, offsetSamples, matches;
  for (var i = 0; i < 1; i++) {
    samples1 = startWave.getSampleRegion('selected', sampleSize);
    samples2 = endWave.getSampleRegion('selected');

    // samples1 = normalize(samples1);
    // samples2 = normalize(samples2);

    matchData = crossCorrelate(samples1, samples2);

    matches = maxN(Array.prototype.slice.call(matchData.real, 0, matchData.real.length / 2), numMatches);


    // recompute sampleSize and regions, iterate
    // sampleSize = 10;
    // region2.start = offsetSamples - 10000;
    // region2.end = offsetSamples + 10000;


  }
  console.log("drawing data");
  drawToCanvas('testDrawWave3', matchData, true);

  console.log("matches", matches);


  // create cycle regions
  var sampleRate1 = startWave.backend.buffer.sampleRate;
  var sampleRate2 = endWave.backend.buffer.sampleRate;
  var color, matchSamples1, matchTime1, matchSamples2, matchTime2, offsetIndex, offsetSamples;
  for (var j = 0; j < numMatches; j++) {

    switch (j) {
      case 0: color = 'rgba(255, 0, 0, 1)'; break;
      case 1: color = 'rgba(0, 255, 0, 1)'; break;
      case 2: color = 'rgba(0, 0, 255, 1)'; break;
      default: color = 'rgba(255, 255, 0, 1)'; break;
    }

    // calculate match points on each wave
    offsetIndex = matches[j].index;
    offsetSamples = offsetIndex * sampleSize;
    matchSamples1 = region1.start;
    matchTime1 = matchSamples1 / sampleRate1;
    matchSamples2 = region2.start + offsetSamples;
    matchTime2 = matchSamples2 / sampleRate2;
    console.log("matchTime1", matchTime1);
    console.log("matchTime2", matchTime2);

    // create regions
    var cycleRegion1 = startWave.regions.add({
      id: 'cycleOut' + j,
      start: matchTime1,
      resize: false,
      loop: false,
      drag: false,
      color: color,
    });
    if (j === 0) {
      cycleRegion1.on('in', function() {
        console.log("cycle1in", this);
        startWave.pause();
        endWave.play(matchTime2);
      });
    }    

    var cycleRegion2 = endWave.regions.add({
      id: 'cycleIn' + j,
      start: matchTime2,
      resize: false,
      loop: false,
      drag: false,
      color: color,
    });
    cycleRegion2.on('in', function() {
      console.log("cycle2in", this);
    });
  }

}

function normalize(arr) {
  var max = maxN(arr, 1)[0].val;
  return [].map.call(arr, function(x) { return x /= max; });
}


function crossCorrelate(samples1, samples2) {
  var arraySize = (samples1.length + samples2.length) * 2;
  var data1 = new ComplexArray(zeroPad(samples1, arraySize));
  var data2 = new ComplexArray(zeroPad(samples2, arraySize));
  // var arraySize = samples1.length;
  // var data1, data2;
  // if (samples1.length > samples2.length) {
  //   data1 = new ComplexArray(samples1);
  //   data2 = new ComplexArray(zeroPad(samples2, arraySize));
  // } else {
  //   arraySize = samples2.length;
  //   data1 = new ComplexArray(zeroPad(samples1, arraySize));
  //   data2 = new ComplexArray(samples2);
  // }

  // corr(a, b) = ifft(fft(a_and_zeros) * conj(fft(b_and_zeros)))
  // console.log("compute ffts", data1.length, data2.length, data1.real, data2.real);
  data1.FFT();
  data2.FFT();

  // normalizeFFT(data1);
  // normalizeFFT(data2);

  // elementwise multiplication of data1 and data2
  // console.log("elementwise multiplication", data1.real, data2.real);
  var data3 = new ComplexArray(arraySize);
  for (var i = 0; i < arraySize; i++) {
    data3.real[i] = data1.real[i] * data2.real[i];
    // take complex conjugate of data2
    data3.imag[i] = data1.imag[i] * -data2.imag[i];
  }

  // console.log("compute ifft", data3.real);
  drawToCanvas('testDrawWave', data1);
  drawToCanvas('testDrawWave2', data2);
  data3.InvFFT();

  return data3;
}

function normalizeFFT(complexArr) {
  var factor = complexArr.length / 2;
  complexArr.map(function(c_value, i, n) {
    c_value.real /= factor;
  });
}


// compute max N 
function maxN(arr, n) {
  n = n || 5;
  var clone = Array.prototype.map.call(arr, function(val, i) {
    return {
      index: i,
      val: val
    };
  });

  var sorted = clone.sort(function(a, b) {
    return b.val - a.val;
  });

  return sorted.slice(0, n);
}

function zeroPad(array, size) {
  var newArray = new Float32Array(size);
  console.log("zeroPad", array.length, size);
  for (var i = 0; i < array.length; i++) {
    newArray[i] = array[i];
  }
  return newArray;
}

function drawToCanvas(element_id, data, normalize) {
  $('#' + element_id + ' canvas').remove();

  var
  element = document.getElementById(element_id)
  canvas = document.createElement('canvas'),
  context = canvas.getContext('2d'),
  width = element.clientWidth,
  height = element.clientHeight,
  n = data.length

  canvas.width = width
  canvas.height = height
  element.appendChild(canvas)

  context.strokeStyle = 'blue'
  context.beginPath()

  var max = maxN(data.real)[0].val;

  data.forEach(function(c_value, i) {
    var val = normalize ? (1.0 - c_value.real/max) : (1.5 - c_value.real);
    context.lineTo(
      i * width / n,
      height/2 * val
      )
  })
  context.stroke()
};

// onload = function() {
//   var
//   data = new complex_array.ComplexArray(128)

//   data.map(function(value, i, n) {
//     value.real = (i > n/3 && i < 2*n/3) ? 1 : 0
//   })

//   drawToCanvas('original', data)

//   data.FFT()
//   drawToCanvas('fft', data)
//   data.map(function(freq, i, n) {
//     if (i > n/5 && i < 4*n/5) {
//       freq.real = 0
//       freq.imag = 0
//     }
//   })
//   drawToCanvas('fft_filtered', data)
//   drawToCanvas('original_filtered', data.InvFFT())

//   drawToCanvas('all_in_one', data.frequencyMap(function(freq, i, n) {
//     if (i > n/5 && i < 4*n/5) {
//       freq.real = 0
//       freq.imag = 0
//     }
//   }))
// }
