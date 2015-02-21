Session.setDefault("uploadStep", 1);

Template.Upload.created = function() {
  this.startSong = Object.create(WaveSurfer);
  this.transition = Object.create(WaveSurfer);
  this.endSong = Object.create(WaveSurfer);
};

Template.Upload.helpers({
  startSongHidden: function() {
    var step = Session.get('uploadStep');
    return step === 2 ? '' : 'hidden';
  },

  endSongHidden: function() {
    var step = Session.get('uploadStep');
    return step === 3 ? '' : 'hidden';
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
  'click .compare': function(e) {
    var step = Session.get('uploadStep');
    var template = Template.instance();
    console.log('click compare', step)
    switch (step) {
      case 2: computeWaveMatch(template.startSong, template.transition); break;
      case 3: computeWaveMatch(template.transition, template.endSong); break;
    }
  },
});

// find offset of waves
function computeWaveMatch(startWave, endWave) {
  console.log("computeWaveMatch");

  function getTargetRegion(wave) {
    var selectedRegion = wave.regions.list.selected;
    console.log(selectedRegion);

    if (selectedRegion) {
      var sampleRate = wave.backend.buffer.sampleRate;
      return {
        start: Math.floor(selectedRegion.start * sampleRate),
        end: Math.floor(selectedRegion.end * sampleRate),
      };
    } else {
      return {
        start: 0,
        end: wave.backend.buffer.length,
      };
    }
  }

  // TODO: determine sample size by array size, iterate
  var sampleSize = 1000;
  var region1 = getTargetRegion(startWave);
  var region2 = getTargetRegion(endWave);

  // iterate cross-correlation with 'zooming in' and increasing sample resolution to find accurate match data
  var samples1, samples2, arraySize, matchData;
  for (var i = 0; i < 1; i++) {
    region1.sampleSize = sampleSize;
    region2.sampleSize = sampleSize;
    samples1 = startWave.getSampleRegion(region1);
    samples2 = endWave.getSampleRegion(region2);
    arraySize = samples1.length + samples2.length;

    matchData = crossCorrelate(samples1, samples2, arraySize);

    // TODO: recompute sampleSize and regions, iterate

  }
  console.log("drawing data");
  drawToCanvas('testDrawWave3', matchData);

  // calculate match points on each wave
  var offsetIndex = arrayMax(matchData.real).index;
  var offsetSamples = offsetIndex * sampleSize;
  // TODO: second wave is translated over first, right?
  var sampleRate1 = startWave.backend.buffer.sampleRate;
  var matchSamples1 = region1.start;
  var matchTime1 = matchSamples1 / sampleRate1;
  var sampleRate2 = endWave.backend.buffer.sampleRate;
  var matchSamples2 = region2.start + offsetSamples;
  var matchTime2 = matchSamples2 / sampleRate2;

  console.log("matchTime1", matchTime1);
  console.log("matchTime2", matchTime2);
  debugger;

  // create cycle regions
  var cycleRegion2 = endWave.regions.add({
    id: 'cycle',
    start: matchTime2 - 1,
    end: matchTime2,
    resize: false,
    loop: false,
    drag: false,
    color: 'rgba(150, 0, 0, 0.4)',
  });
  cycleRegion2.on('in', function() {
    console.log("cycle2in", arguments);
  });
  cycleRegion2.on('out', function() {
    console.log("cycle2out", arguments);
  });

  var cycleRegion1 = startWave.regions.add({
    id: 'cycle',
    start: matchTime1 - 1,
    end: matchTime1,
    resize: false,
    loop: false,
    drag: false,
    color: 'rgba(150, 0, 0, 0.4)',
  });
  cycleRegion1.on('in', function() {
    console.log("cycle1in", arguments);
  });
  cycleRegion1.on('out', function() {
    console.log("cycle1out", arguments);
  });



  console.log("max", arrayMax(matchData.real));





  // TODO: add callback to region.out to play songs
}


function crossCorrelate(samples1, samples2, arraySize) {

  var data1 = new ComplexArray(zeroPad(samples1, arraySize));
  var data2 = new ComplexArray(zeroPad(samples2, arraySize));

  // corr(a, b) = ifft(fft(a_and_zeros) * conj(fft(b_and_zeros)))
  console.log("compute ffts", data1.length, data2.length, data1.real, data2.real);
  data1.FFT();
  data2.FFT();

  // TODO: does it make sense to use min length? what if one array is really short?
  console.log("elementwise multiplication", data1.real, data2.real);
  var data3 = new ComplexArray(arraySize);
  for (var i = 0; i < arraySize; i++) {
    data3.real[i] = data1.real[i] * data2.real[i];
    // take complex conjugate of data2
    data3.imag[i] = data1.imag[i] * -data2.imag[i];
  }

  console.log("compute ifft", data3.real);
  drawToCanvas('testDrawWave', data1);
  drawToCanvas('testDrawWave2', data2);
  data3.InvFFT();

  return data3;
}

function arrayMax(arr) {
  var index = null;
  var max = -Infinity;
  for (var i = 0; i < arr.length; i++) {
    var val = arr[i];
    if (max < val) {
      max = val;
      index = i;
    }
  }
  return {
    max: max,
    index: index,
  };
}

function zeroPad(array, size) {
  var newArray = new Float32Array(size);
  console.log("zeroPad", array.length, size);
  for (var i = 0; i < array.length; i++) {
    newArray[i] = array[i];
  }
  return newArray;
}

function drawToCanvas(element_id, data) {
  // $('element_id canvas')
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
  data.forEach(function(c_value, i) {
    context.lineTo(
      i * width / n,
      height/2 * (1.5 - c_value.real)
      )
  })
  context.stroke()
};

// TODO
// 1. find suggested correlation position
// 2. test accuracy
// 3. allow region selection to fine-tune calculation
// 3. add UI element for adjusting sample size.
// 4. add UI element to tell user expected length of array they will FFT (size(regionA) + size(regionB))/sampleSize

// 5. scan for correct area with low res, 'zoom in' and increase res to find spot

// Steps
// 1. normalize,
// 2. zero pad, at least N = size(a)+size(b)-1, 
// 2. cross correlate: corr(a, b) = ifft(fft(a_and_zeros) * fft(b_and_zeros[reversed]))
// 3. improve: 
// a. "You can get a more precise estimate of the offset (better than the resolution of your samples) by using parabolic/quadratic interpolation on the peak."
// 4. optimize: 
// a. "If the signals are real, you can use real FFTs (RFFT/IRFFT) and save half your computation time by only calculating half of the spectrum."
// b. "stop if you've found a sufficient correlation"
// c. Round zero padding up to a power of 2.
// d. tweak samplesize. 
// e. exploit y-axis symmetry, cut calculations in half

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
