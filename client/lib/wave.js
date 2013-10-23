Wave = {

  //
  // functions
  // 

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

  'markStart': function(wave, position) {
    wave.mark({
      'id': 'start',
      'position': position || Wave.getPosition(wave),
      'color': 'rgba(0, 255, 0, 0.8)'
    });
  },

  'markEnd': function(wave, position) {
    wave.mark({
      'id': 'end',
      'position': position || Wave.getPosition(wave),
      'color': 'rgba(255, 0, 0, 0.8)'
    });
  },

  'markHover': function(wave, position) {
    position = position || 0;
    wave.mark({
      'id': 'hover',
      'position': position,
      'color': 'rgba(255, 255, 255, 0.8)'
    });
  },

  'addVolumeAutomation': function(wave, startTime, endTime, endVol) {
    var stepSize = 0.01;
    if (typeof wave.volume === 'undefined') { wave.volume = wave.sample.volume; }
    var startVol = wave.volume;

    // schedule start and stop of automation if not scheduled
    if (!wave.markers['volume']) {
      wave.on('mark', function(mark) {
        // start volume automation
        if ((mark && mark.id) === 'volume') {
          wave.interval = wave.startAutomation();
        }
      });
    }

    // mark waves with automation times
    wave.mark({
      'id': 'volume',
      'position': startTime
    });
    wave.markers['volume'].played = false;

    // TODO: check start and end times

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
      }, 1000 * deltat);

      // begin automation
      return Meteor.setInterval(function () {
        console.log("wave volume: "+wave.volume);
        wave.volume += stepSize;
        wave.setVolume(Session.get("mixer_volume") * wave.volume);
      }, secondsPerStep * 1000);
    };
  }

  
};