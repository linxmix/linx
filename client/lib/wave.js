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
    return Wave.getPosition(wave) / Wave.getDuration(wave);
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

  
};