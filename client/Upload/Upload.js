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
      case 2: compareWaves(template.startSong, template.transition); break;
      case 3: compareWaves(template.transition, template.endSong); break;
    }
  },
});

// find offset of waves
function compareWaves(wave1, wave2) {
  console.log("compareWaves", wave1 === wave2);

  var samples1 = wave1.getSampleRegion();
  var samples2 = wave2.getSampleRegion();
  var N = samples1.length + samples2.length;
  var data1 = new ComplexArray(zeroPad(samples1, N));
  var data2 = new ComplexArray(zeroPad(samples2, N));

  // corr(a, b) = ifft(fft(a_and_zeros) * conj(fft(b_and_zeros)))
  console.log("compute ffts", N, data1.length, data2.length, data1.real, data2.real);
  debugger;
  data1.FFT();
  data2.FFT();

  // TODO: does it make sense to use min length? what if one array is really short?
  console.log("elementwise multiplication", data1.real, data2.real);
  data3 = new ComplexArray(N);
  for (var i = 0; i < N; i++) {
    data3.real[i] = data1.real[i] * data2.real[i];    
    // take complex conjugate of data2
    data3.imag[i] = data1.imag[i] * -data2.imag[i];    
  }

  console.log("compute ifft", data3.real)
  data3.InvFFT();

  console.log("max", arrayMax(data3.real));

  console.log("drawing data");
  drawToCanvas('testDrawWave', data1);
  drawToCanvas('testDrawWave2', data2);
  drawToCanvas('testDrawWave3', data3);

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
