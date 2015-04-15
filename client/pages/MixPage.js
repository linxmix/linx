Template.MixPage.created = function() {
  Utils.initTemplateModel.call(this, 'mix');

  this.trackModalIndex = new ReactiveVar(-1);
  this.linkModalIndex = new ReactiveVar(-1);

  // auto compare waves
  // this.autorun(function() {
  //   var template = Template.instance();
  //   var tracks = template.tracks;
  //   var active = template.linkModalIndex.get();
  //   console.log("template tracks", tracks);

  //   if (tracks) {
  //     var fromTrack = tracks[active - 1];
  //     var toTrack = tracks[active];

  //     if ((fromTrack && fromTrack.getEchonestAnalysis()) &&
  //       (toTrack && toTrack.getEchonestAnalysis())) {
  //       compareTracks(fromTrack, toTrack);
  //     }
  //   }

  // }.bind(this));
};

function getMix(template) {
  var model = template.data.mix;
  return model;
}

Template.MixPage.helpers({
  title: function() {
    return getMix(Template.instance()).get('title');
  },

  createdBy: function() {
    var user = Meteor.user();
    return user && user.username;
  },

  trackCountText: function() {
    var trackCount = getMix(Template.instance()).getLength();
    if (!trackCount) {
      return "0 Tracks";
    } else if (trackCount === 1) {
      return "1 Track";
    } else {
      return trackCount + " Tracks";
    }
  },

  saveButtonClass: function() {
    var mix = getMix(Template.instance());
    return mix.isDirty() ? '' : 'disabled';
  },

  tracksAccordion: function() {
    var template = Template.instance();
    var trackModalIndex = template.trackModalIndex;
    var linkModalIndex = template.linkModalIndex;
    var mix = getMix(template);

    var tracks = template.tracks = mix.getTracks();

    // TODO: make waves
          // links=links
          // linkFrom=linkFrom
          // linkTo=linkTo
          // onWaveEnd=onWaveEnd
          // hideLoadOptions=true

    return tracks.map(function(track, i) {
      return {
        index: i,
        trackModalIndex: trackModalIndex,
        linkModalIndex: linkModalIndex,
        track: track,
        mix: mix,
      };
    });
  },
});

Template.MixPage.events({
  'click .save-mix': function(e, template) {
    var mix = getMix(template);
    var doRedirect = !mix.get('_id');
    console.log('save mix', mix.get('_id'));
    mix.save();
    // redirect to MixPage if this is a new mix
    if (doRedirect) {
      Router.go('mix', {
        _id: mix.get('_id')
      });
    }
  },

  'click .append-track': function(e, template) {
    var mix = getMix(template);
    Router.go('mix.add-track', {
      _id: mix.get('_id'),
      index: mix.getLength(),
    });
  }
});

// region params
// id: region.get('_id'),
// start: region.getTime(track.get('_id')),
// color: color,

function compareTracks(fromTrack, toTrack) {
  console.log('compareTracks', fromTrack, toTrack);

  var matches = compareSegs(getSegs(fromTrack.getEchonestAnalysis()), getSegs(toTrack.getEchonestAnalysis()));
  var bestMatches = _.sortBy(matches, 'dist');
  console.log("best matches", bestMatches);

  var toWave = toTrack.getWave();
  var fromWave = fromTrack.getWave();

  // set new regions
  var fromRegions = [];
  var toRegions = [];
  for (var i = 0; i < 4; i++) {
    var match = bestMatches[i];
    var params = {
      resize: false,
      loop: false,
      drag: false,
    };

    fromRegions.push(_.defaults({
      start: match.seg1,
    }, params));

    toRegions.push(_.defaults({
      start: match.seg2,
    }, params));
  }
  fromWave.set('regions', fromRegions);
  toWave.set('regions', toRegions);

  // set active mixPoint
  // Utils.setMixPoint(mixPoints[0], fromWave, toWave);
}

function getSegs(analysis) {
  var segments = analysis.segments;
  // var selectedRegion = wave.getRegion('selected');
  return _.filter(segments, function (seg) {
    var THRESH = 0.5;
    var isWithinConfidence = (seg.confidence >= THRESH);
    // var isWithinRegion = (seg.start >= selectedRegion.start) &&
      // (seg.start <= selectedRegion.end);
    // return isWithinRegion && isWithinConfidence;
    return isWithinConfidence;
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
