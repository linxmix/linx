Wave = {

  //
  // functions
  // 
  'clearMark': function(wave, id) {
    (wave.markers[id] && wave.markers[id].remove());
  },

  // position is in seconds
  'getPosition': function(wave) {
    return (wave && wave.timings()[0]);
  },

  // duration is in seconds
  'getDuration': function(wave) {
    return (wave && wave.timings()[1]);
  },

  // progress is in percent
  'getProgress': function(wave) {
    return (Wave.getPosition(wave) / Wave.getDuration(wave)) || 0;
  },

  'seekHome': function(wave) {
    wave.seekTo(0);
  },

  'seekEnd': function(wave) {
    wave.seekTo(1);
  },

  'seekToPos': function(wave, position) {
    position = position || 0;
    wave.seekTo(position / Wave.getDuration(wave));
  },

  'markStart': function(wave, position) {
    return wave.mark({
      'id': 'start',
      'position': position || Wave.getPosition(wave),
      'color': 'rgba(0, 255, 0, 0.8)'
    });
  },

  'markEnd': function(wave, position) {
    return wave.mark({
      'id': 'end',
      'position': position || Wave.getPosition(wave),
      'color': 'rgba(255, 0, 0, 0.8)'
    });
  },

  'markTrackEnd': function(wave) {
    return wave.mark({
      'id': 'track_end',
      'position': Wave.getDuration(wave),
    });
  },

  'markHover': function(wave, position) {
    position = position || 0;
    return wave.mark({
      'id': 'hover',
      'position': position,
      'color': 'rgba(255, 255, 255, 0.8)'
    });
  },

  'markPlay': function(wave, position) {
    position = position || 0;
    return wave.mark({
      'id': 'lastPlay',
      'position': position,
      'color': 'rgba(0, 0, 0, 1.0)'
    });
  },

  'zoom': function(wave, percent, additive) {
    var lastPercent = wave.lastPercent || 5;
    if (additive) {
      percent += lastPercent;
    }

    // set bounds on zoom %
    if (percent > 100) {
      percent = 100;
    } else if (percent < 1) {
      percent = 1;
    }

    // run zoom only if our percent changed
    if (percent !== lastPercent) {

      // if many zooms are called in a row, only handle last zoom
      if (wave.zoom) {
        Meteor.clearTimeout(wave.zoom);
        wave.zoom = undefined;
      }

      wave.zoom = Meteor.setTimeout(function () {
        wave.lastPercent = percent;
        // do zoom
        wave.params['minPxPerSec'] = wave.drawer.params['minPxPerSec'] =
          getZoomPx(wave, percent);
        // redraw wave
        redrawWave(wave);
        // if waveid exists, update zoomSlider, and enable overscroll
        if (wave.id) {
          var selector = '#'+wave.id;
          $(selector+' .zoomSlider').slider('setValue', percent);
          // enable overscroll on wave
          $(selector+' wave').first().overscroll({
            'captureWheel': false,
            'direction': 'horizontal',
          });
        }
      }, 50);
    }
  },

  'addVolumeAutomation': function(wave, startTime, endTime, endVol) {
    var stepSize = 0.01;
    if (typeof wave.volume === 'undefined') {
      wave.volume = wave.sample.startVolume;
    }
    var startVol = wave.volume;

    // if start and end vol are the same, we're done
    if (startVol === endVol) {
      return;
    }
    
    console.log("adding volume automation with args: ");
    console.log(arguments);

    // validation
    if ((startTime === undefined) ||
      (endTime === undefined) ||
      (startVol === undefined) ||
      (endVol === undefined)) {
      return console.log("ERROR: addVolumeAutomation given invalid args!");
    }

    // first clear any previous intervals
    if (wave.interval) {
      Meteor.clearInterval(wave.interval);
      wave.interval = undefined;
    }

    // schedule start of automation if not scheduled
    if (!wave.markers['volume']) {
      wave.on('mark', function(mark) {
        // start volume automation
        if ((mark && mark.id) === 'volume') {
          wave.interval = wave.startAutomation();
        }
      });
    }

    // mark wave with automation time
    wave.mark({
      'id': 'volume',
      'position': startTime
    });
    wave.markers['volume'].played = false;

    // calculate automation interval
    var deltat = endTime - startTime; // total change in time
    var deltav = endVol - startVol; // total change in volume
    var secondsPerStep = stepSize * (deltat / deltav);
    // if secondsPerStep is negative, flip direction
    if (secondsPerStep < 0) {
      secondsPerStep *= -1;
      stepSize *= -1;
    }

    // make automation function
    wave.startAutomation = function () {

      // schedule automation end
      Meteor.setTimeout(function () {
        Meteor.clearInterval(wave.interval);
        wave.interval = undefined;
        wave.volume = endVol;
        wave.setVolume(Session.get("mixer_volume") * wave.volume);
      }, 1000 * deltat);

      // begin automation
      return Meteor.setInterval(function () {
        wave.volume += stepSize;
        console.log("wave volume: "+wave.volume);
        wave.setVolume(Session.get("mixer_volume") * wave.volume);
      }, secondsPerStep * 1000);
    };
  },
  
};


//
// zoom stuff
//
function getZoomPx(wave, percent) {
  // find max zoom
  var MAX_CANVAS_WIDTH = 32767; // current limit in google chrome
  var maxZoom = Math.floor(MAX_CANVAS_WIDTH / Wave.getDuration(wave));
  // calculate px and return
  return (percent / 100.0) * maxZoom;
}

function redrawWave(wave) {
  // redraw wave
  wave.drawBuffer();
  // update with and center screen on progress if wave is not playing
  var playingWave = Uploader.waves['playing'];
  if (!(playingWave && (playingWave['id'] === wave.id))) {
    var hoverMarker = wave.markers['hover'];
    var progress = Wave.getProgress(wave) ||
      (hoverMarker && hoverMarker.percentage);
    wave.drawer.recenterOnPosition(~~(wave.drawer.scrollWidth * progress), true);
  }
  // update markers
  for (var waveId in wave.markers) {
    wave.drawer.addMark(wave.markers[waveId]);
  }
}
