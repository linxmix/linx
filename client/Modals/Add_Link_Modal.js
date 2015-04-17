var selectedLink; // share between inner and outer

Template.Add_Link_Modal.created = function() {
  Utils.requireTemplateData.call(this, 'onSubmit');
  Utils.requireTemplateData.call(this, 'onCancel');

  Utils.initTemplateModel.call(this, 'fromTrack');
  Utils.initTemplateModel.call(this, 'fromWave');
  Utils.initTemplateModel.call(this, 'toTrack');
  Utils.initTemplateModel.call(this, 'toWave');
};

Template.Add_Link_Modal.rendered = function() {
  var template = this;
  template.$('.modal').modal({
    detachable: true,
    closable: false,
    transition: 'scale',
    onDeny: function() {
      // TODO: this will break if data changes
      template.data.onCancel();
    },
    onApprove: function() {
      // TODO: this will break if data changes
      template.data.onSubmit(selectedLink.get());
    }
  }).modal('show');
};

Template.Add_Link_Modal_Inner.created = function() {
  selectedLink = this.selectedLink = new ReactiveVar(this.data.link);
};

Template.Add_Link_Modal_Inner.rendered = function() {
  // auto compare waves
  // this.autorun(function() {
};

Template.Add_Link_Modal_Inner.helpers({
  selectedLink: function() {
    return Template.instance().selectedLink.get();
  },

  links: function() {
    return Template.instance().links.get();
  },

  isValidSelection: function() {
    return !!Template.instance().selectedLink.get();
  },

  selectLink: function() {
    var template = Template.instance();
    return function(link) {
      template.link.set(link);
    };
  }
});

Template.Add_Link_Modal_Inner.events({
  'keyup': function (e, template) {
    // TODO
    // console.log("keyup", e);
    // if (e.which === 27) { template.$('.deny').click(); } // escape
    // if (e.which === 13) { template.$('.approve').click(); } // enter
  },

  'click .compare': function(e, template) {
    var fromWave = template.data.fromWave;
    var toWave = template.data.toWave;

    console.log("compare waves", fromWave.getAnalysis(), toWave.getAnalysis());
    if (!(fromWave.getAnalysis() && toWave.getAnalysis())) {
      // TODO: make this better
      fromWave.analyze();
      toWave.analyze();
      return;
    } else {
      // compare waves, then add regions
      var matches = fromWave.compareTo(toWave);

      // TODO: move this all into wave?
      for (var i = 0; i < 4; i++) {
        var match = matches[i];

        // TODO: need to clean up old links
        var link = Links.create();

        var color;
        switch (i) {
          case 0: color = 'rgba(255, 0, 0, 1)'; break;
          case 1: color = 'rgba(0, 255, 0, 1)'; break;
          case 2: color = 'rgba(0, 0, 255, 1)'; break;
          default: color = 'rgba(255, 255, 0, 1)'; break;
        }
        var params = {
          linkId: link.get('_id'),
          color: color
        };

        fromWave.regions.add(_.defaults({
          start: match.seg1,
        }, params));

        toWave.regions.add(_.defaults({
          start: match.seg2,
        }, params));
      }
    }
  }
});

// region params
// id: region.get('_id'),
// start: region.getTime(track.get('_id')),
// color: color,

function compareTracks(fromTrack, toTrack) {
  console.log('compareTracks', fromTrack, toTrack);

  var matches = compareSegs(getSegs(fromTrack.getAnalysis()), getSegs(toTrack.getAnalysis()));
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
