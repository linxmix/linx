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
          var traktor = cuePositions.times[0];
          var webaudio = Wave.getDuration(startWave);
          var written = cuePositions.outs[0];
          var time = written - (traktor - webaudio);
          console.log("marking start end", time);
          Uploader.markWaveEnd(startWave, time);
        });
        transitionWave.once('ready', function () {
          var traktor = cuePositions.times[1];
          var webaudio = Wave.getDuration(transitionWave);
          var written_in = cuePositions.ins[0];
          var written_out = cuePositions.outs[1];
          var time_in = written_in - (traktor - webaudio);
          var time_out = written_out - (traktor - webaudio);
          console.log("marking transition start", time_in);
          console.log("marking transition end", time_out);
          Wave.markStart(transitionWave, time_in);
          Uploader.markWaveEnd(transitionWave, time_out);
        });
        endWave.once('ready', function () {
          var traktor = cuePositions.times[2];
          var webaudio = Wave.getDuration(endWave);
          var written = cuePositions.ins[1];
          var time = written - (traktor - webaudio);
          console.log("marking end start", time);
          Wave.markStart(endWave, time);
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
  var inCue = /NAME="linx in".*\n/gi;
  var outCue = /NAME="linx out".*\n/gi;
  var cuePos = /START="\d+\.?\d*"/;
  var playTime = /PLAYTIME_FLOAT="\d+\.?\d*"/g;

  // get lines with cue data
  var inLines = text.match(inCue);
  var outLines = text.match(outCue);
  var timeLines = text.match(playTime);

  // get cue positions from cue data
  var ins = inLines.map(function (line) {
    var str = line.match(cuePos)[0];
    str = str.replace("START=", "");
    str = str.replace("\"", "");
    return parseFloat(str) / 1000.0;
  });
  var outs = outLines.map(function (line) {
    var str = line.match(cuePos)[0];
    str = str.replace("START=", "");
    str = str.replace("\"", "");
    return parseFloat(str) / 1000.0;
  });
  var times = timeLines.map(function (line) {
    var str = line.replace("PLAYTIME_FLOAT=", "");
    str = str.replace("\"", "");
    return parseFloat(str);
  });
  console.log(ins);
  console.log(outs);
  console.log(times);
  return {
    'ins': ins,
    'outs': outs,
    'times': times,
  };
}