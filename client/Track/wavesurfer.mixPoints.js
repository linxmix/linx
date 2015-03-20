// Augment WaveSurfer Prototype
Meteor.startup(function() {

  WaveSurfer.setMixIn = Utils.withErrorHandling(function(id) {
    var prevId = this.getMeta('mixIn');
    debugger;
    if (id && id !== prevId) {
      // add if not already there
      if (!this.hasMixPoint(id)) {
        this.addMixPoint(id);
      }
      this._setMeta({ mixIn: id });
    }
  }, 'setMixIn');

  WaveSurfer.setMixOut = Utils.withErrorHandling(function(id, inWave) {
    var prevId = this.getMeta('mixOut');
    if (id !== prevId) {
      // add if not already there
      if (!this.hasMixPoint(id)) {
        this.addMixPoint(id);
      }
      this._setMeta({ mixOut: id });

      // remove previous handler, if any
      if (prevId) {
        var prevInRegion = inWave.getRegion(prevId);
        // TODO: does this work?
        prevInRegion.off('in');
      }
    }
  }, 'setMixOut');

  WaveSurfer.persistMixPoints = Utils.withErrorHandling(function() {
    // TODO: delete deleted mix points?
    // save mix points
    this.getMixPoints().forEach(function(mixPoint) {
      mixPoint.persist();
    });
    // save track references
    this.saveTrack({ mixPointIds: this.getMeta('mixPointIds') });
  }, 'persistMixPoints');

  WaveSurfer.drawMixPoints = function() {
    var wave = this;
    this.getMixPoints().forEach(function(mixPoint, i) {
      var color;
      // switch (i) {
      //   case 0: color = 'rgba(255, 0, 0, 1)'; break;
      //   case 1: color = 'rgba(0, 255, 0, 1)'; break;
      //   case 2: color = 'rgba(0, 0, 255, 1)'; break;
      //   default: color = 'rgba(255, 255, 0, 1)'; break;
      // }
      console.log("I", i);
      switch (i) {
        case 0: color = 'rgba(255, 0, 0, 0.8)'; break;
        case 1: color = 'rgba(0, 255, 0, 0.8)'; break;
        case 2: color = 'rgba(0, 0, 255, 0.8)'; break;
        default: color = 'rgba(255, 255, 0, 0.8)'; break;
      }

      var params = {
        id: mixPoint._id,
        start: mixPoint.getStart(wave.getMeta('_id')),
        resize: false,
        loop: false,
        drag: false,
        color: color,
      };
      var region = wave.getRegion(mixPoint._id);
      if (!region) {
        console.log("new region", params);
        region = wave.regions.add(params);
      } else {
        console.log("update region", params);
        region.update(params);
      }
    });
  };

  WaveSurfer.addMixPoint = Utils.withErrorHandling(function(id) {
    var mixPointIds = this.getMeta('mixPointIds');
    mixPointIds.push(id);
    this._setMeta({ mixPointIds: _.uniq(mixPointIds) });
    this.drawMixPoints();
  }, 'addMixPoint');

  WaveSurfer.addMixPoints = Utils.withErrorHandling(function(ids) {
    var mixPointIds = this.getMeta('mixPointIds');
    this._setMeta({ mixPointIds: _.uniq(mixPointIds.concat(ids)) });
    this.drawMixPoints();
  }, 'addMixPoints');

  // does not delete MixPoint models
  WaveSurfer.removeMixPoint = Utils.withErrorHandling(function(id) {
    if (this.hasMixPoint(id)) {
      // possibly remove from mixIn and mixOut
      if (this.getMeta('mixIn') === id) {
        this.setMixIn(null);
      }
      if (this.getMeta('mixOut') === id) {
        this.setMixOut(null);
      }

      var mixPointIds = this.getMeta('mixPointIds');
      mixPointIds = mixPointIds.filter(function(existingId) {
        return id !== existingId;
      });
      // remove corresponding region
      this.getRegion(id).remove();

      this._setMeta({ mixPointIds: mixPointIds });
      this.drawMixPoints();
    }
  }, 'removeMixPoint');

  // does not delete MixPoint models
  WaveSurfer.removeMixPoints = Utils.withErrorHandling(function() {
    var wave = this;
    this.getMixPoints().forEach(function(id) {
      // possibly remove from mixIn and mixOut
      if (wave.getMeta('mixIn') === id) {
        wave.setMixIn(null);
      }
      if (wave.getMeta('mixOut') === id) {
        wave.setMixOut(null);
      }

      var mixPointIds = wave.getMeta('mixPointIds');
      mixPointIds = mixPointIds.filter(function(existingId) {
        return id !== existingId;
      });
      // remove corresponding region
      wave.getRegion(id).remove();

    });

    // remove mix points
    wave._setMeta({ mixPointIds: [] });
  }, 'removeMixPoint');

  WaveSurfer.hasMixPoint = Utils.withErrorHandling(function(id) {
    return !!_.find(this.getMeta('mixPointIds'), function(mixPointId) {
      return mixPointId === id;
    });
  }, 'hasMixPoint');

  WaveSurfer.getMixPoints = Utils.withErrorHandling(function() {
    return (this.getMeta('mixPointIds') || []).map(function(id) {
      return MixPoints.findOne(id);
    });
  }, 'getMixPoints');

});
