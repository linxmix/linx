Session.setDefault("uploadStep", 1);

Template.Upload.created = function() {
  // globals for easier debugging
  StartSong = this.startSong = Utils.createWaveSurfer();
  Transition = this.transition = Utils.createWaveSurfer();
  EndSong = this.endSong = Utils.createWaveSurfer();
};

function getActiveWaves(template) {
  switch (Session.get('uploadStep')) {
    case 1: return [template.transition];
    case 2: return [template.startSong, template.transition];
    case 3: return [template.transition, template.endSong];
    default: return [];
  }
}

function getMixPointInfo(template) {
  if (Session.equals('uploadStep', 1)) {
    return {};
  }
  var inWave = getActiveWaves(template)[0];
  return {
    activeId: inWave.getMeta('mixOut'),
    points: inWave.getMixPoints(),
  };
}

function wavesAreLoading(template) {
  return getActiveWaves(template).reduce(function(anyLoading, wave) {
    return anyLoading || wave.isLoading();
  }, false);
}

function wavesAreLoaded(template) {
  return getActiveWaves(template).reduce(function(allLoaded, wave) {
    return allLoaded && wave.isLoaded();
  }, true);
}

function wavesAreSaved(template) {
  return getActiveWaves(template).reduce(function(allSaved, wave) {
    return allSaved && !wave.isLocal();
  }, true);
}

function wavesAreAnalyzed(template) {
  return getActiveWaves(template).reduce(function(allAnalyzed, wave) {
    return allAnalyzed && wave.isAnalyzed();
  }, true);
}

function regionsAreSelected(template) {
  return getActiveWaves(template).reduce(function(allHaveRegions, wave) {
    return allHaveRegions && wave.hasSelectedRegion();
  }, true);
}

function setMixPoint(mixPointId, template) {
  var activeWaves = getActiveWaves(template);
  var inWave = activeWaves[0];
  var outWave = activeWaves[1];
  Utils.setMixPoint(MixPoints.findOne(mixPointId), inWave, outWave);
}

Template.Upload.helpers({
  mixPointButtons: function() {
    var template = Template.instance();

    function onClick(mixPointId) {
      var mixPointInfo = getMixPointInfo(template);
      console.log("click mix point", mixPointId, mixPointInfo);
      if (mixPointInfo.activeId !== mixPointId) {
        setMixPoint(mixPointId, template);
      }
    }

    var mixPointInfo = getMixPointInfo(template);
    var colors = ['red', 'green', 'blue'];
    return (mixPointInfo.points || []).map(function(mixPoint, i) {
      var isActive = (mixPointInfo.activeId === mixPoint._id);
      var color = colors[i % colors.length];
      return {
        mixPointId: mixPoint._id,
        iconClass: isActive ? 'volume up icon' : 'volume off icon',
        buttonClass: (isActive ? 'active ' : ' ') + color,
        onClick: onClick,
      };
    });
  },

  startSongHidden: function() {
    var step = Session.get('uploadStep');
    return step === 2 ? '' : 'hidden';
  },

  endSongHidden: function() {
    var step = Session.get('uploadStep');
    return step === 3 ? '' : 'hidden';
  },

  showCompareButtons: function() {
    return !Session.equals('uploadStep', 1);
  },

  compareButtonClass: function() {
    var template = Template.instance();
    if (wavesAreLoading(template)) {
      return 'disabled loading';
    } else if (!wavesAreLoaded(template)) {
      return 'disabled';
    } else if (!wavesAreSaved(template)) {
      return 'orange cloud save';
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
    if (wavesAreLoading(template)) {
      return 'loading icon';
    } else if (!wavesAreLoaded(template)) {
      return 'pointing down icon';
    } else if (!wavesAreSaved(template)) {
      return 'cloud upload icon';
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
    } else if (!wavesAreSaved(template)) {
      return 'Save';
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
  'click .compare-button.save': function(e, template) {
    getActiveWaves(template).filter(function(wave) {
      return wave.isLocal();
    }).forEach(function(wave) {
      wave.uploadToBackend();
    });
  },

  'click .compare-button.analyze': function(e, template) {
    getActiveWaves(template).filter(function(wave) {
      return !wave.isAnalyzed();
    }).forEach(function(wave) {
      wave.fetchEchonestAnalysis();
    });
  },

  'click .compare-button.compare': function(e, template) {
    var activeWaves = getActiveWaves(template);
    var inWave = activeWaves[0];
    var outWave = activeWaves[1];
    var matches = compareSegs(getSegs(inWave), getSegs(outWave));
    var bestMatches = _.sortBy(matches, 'dist');
    console.log("best matches", bestMatches);

    // create mixPoints from bestMatches
    var inTrack = inWave.getTrack();
    var outTrack = outWave.getTrack();
    var mixPoints = bestMatches.map(function(match) {
      return Utils.createLocalModel(MixPoints, {
        inId: inTrack._id,
        inLinxType: inTrack.linxType,
        endIn: match.seg1,

        outId: outTrack._id,
        outLinxType: outTrack.linxType,
        startOut: match.seg2,
      });
    });

    // clear old mixPoints
    inWave.removeMixPoints();
    outWave.removeMixPoints();

    // set new mixPoints
    var length = 3;
    inWave.addMixPoints(_.pluck(mixPoints.slice(0, length), '_id'));
    outWave.addMixPoints(_.pluck(mixPoints.slice(0, length), '_id'));

    // set active mixPoint
    Utils.setMixPoint(mixPoints[0], inWave, outWave);
  },
});

Template.MixPointButton.events({
  'click .button.mix-point': function(e, template) {
    var mixPointId = template.data.mixPointId;
    template.data.onClick(mixPointId);
  },
});

function getSegs(wave) {
  var THRESH = 0.5;
  var analysis = wave.getAnalysis();
  var segments = analysis.segments;
  var selectedRegion = wave.getRegion('selected');
  return _.filter(segments, function (seg) {
    var isWithinConfidence = (seg.confidence >= THRESH);
    var isWithinRegion = (seg.start >= selectedRegion.start) &&
      (seg.start <= selectedRegion.end);
    return isWithinRegion && isWithinConfidence;
  });
}

function compareSegs(segs1, segs2) {
  var matches = [];
  segs1.forEach(function (seg1) {
    segs2.forEach(function (seg2) {
      // compute distance between segs
      matches.push({
        'seg1': seg1.start,
        'seg2': seg2.start,
        'dist': euclidean_distance(seg1.timbre, seg2.timbre),
      });
    });
  });
  return matches;
}

// expects v1 and v2 to be the same length and composition
function euclidean_distance(v1, v2) {
  //debug("computing distance", v1, v2);
  var sum = 0;
  for (var i = 0; i < v1.length; i++) {
    // recursive for nested arrays
    //if (v1[i] instanceof Array) {
    //  sum += euclidean_distance(v1[i], v2[i]);
    //} else {
      var delta = v2[i] - v1[i];
      sum += delta * delta;
    //}
    //debug("running total", sum);
  }
  return Math.sqrt(sum);
}
