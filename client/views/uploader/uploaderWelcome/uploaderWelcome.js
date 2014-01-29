//
// for reading traktor nml files
//
Template.uploaderWelcome.events({

  'dragover': function (e) {
    e.stopPropagation();
    e.preventDefault();
  },

  'dragleave': function (e) {
    e.stopPropagation();
    e.preventDefault();
  },

  'drop': function (e) {
    e.stopPropagation();
    e.preventDefault();
    parseFiles(e.dataTransfer.files);
  },

});

// read given file(s) as an exported traktor playlist
function parseFiles(files) {
  console.log(files);

  //
  // read first file as NML
  //
  var nml = files[0];
  var startSong = files[1];
  var transitionSong = files[2];
  var endSong = files[3];
  if (nml.name.match(/\.nml$/)) {
    // Create file reader
    var reader = new FileReader();
    reader.addEventListener('load', function (e) {

      // get cue positions
      cuePositions = parseNML(reader.result);
      if (cuePositions && startSong && transitionSong && endSong) {
        var startWave = Uploader.waves['startWave'];
        var endWave = Uploader.waves['endWave'];
        var transitionWave = Uploader.waves['transitionWave'];

        // mark waves
        startWave.once('ready', function () {
          console.log("marking start end", cuePositions.outs[0]);
          Uploader.markWaveEnd(startWave, cuePositions.outs[0]);
        });
        transitionWave.once('ready', function () {
          console.log("marking transition start", cuePositions.ins[0]);
          console.log("marking transition end", cuePositions.outs[1]);
          Wave.markStart(transitionWave, cuePositions.ins[0]);
          Uploader.markWaveEnd(transitionWave, cuePositions.outs[1]);
        });
        endWave.once('ready', function () {
          console.log("marking end start", cuePositions.ins[1]);
          Wave.markStart(endWave, cuePositions.ins[1]);
        });

        // load waves
        Uploader.waves['startWave'].loadArrayBuffer(startSong);
        Uploader.waves['transitionWave'].loadArrayBuffer(transitionSong);
        Uploader.waves['endWave'].loadArrayBuffer(endSong);

      } else {
        console.log("ERROR: problem with below cuePositions or songs");
        console.log(cuePositions, startSong, transitionSong, endSong);
        return;
      }
    });
    reader.addEventListener('error', function (e) {
      console.log("ERROR READING FILE:", e);
    });
    reader.readAsText(nml);
  } else {
    console.log ("ERROR: nml was not first file in batch");
    return;
  }
}

// extract cue information
function parseNML(text) {
  var inCue = /NAME=\"linx in\".*\n/gi;
  var outCue = /NAME=\"linx out\".*\n/gi;

  // get lines with cue data
  var inLines = text.match(inCue);
  var outLines = text.match(outCue);

  // get cue positions from cue data
  var ins = inLines.map(function (line) {
    var str = line.match(/START="\d+\.?\d*"/)[0];
    str = str.replace("START=", "");
    str = str.replace("\"", "");
    return parseFloat(str) / 1000.0;
  });
  var outs = outLines.map(function (line) {
    var str = line.match(/START="\d+\.?\d*"/)[0];
    str = str.replace("START=", "");
    str = str.replace("\"", "");
    return parseFloat(str) / 1000.0;
  });
  console.log(ins);
  console.log(outs);
  return {
    'ins': ins,
    'outs': outs,
  };
}