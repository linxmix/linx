/* global Utils: true */

Utils = {
  fullPageDropInitialized: false,
  lastDragTarget: null,
  initFullPageDrop: function(cb) {
    if (this.fullPageDropInitialized) {
      throw new Error("Full page drop already initialized");
    } else {
      this.fullPageDropInitialized = true;
      this.lastDragTarget = null;
    }

    // setup handlers
    this.dragenter = this.dragenter || function(e) {
      Utils.lastDragTarget = e.target;
      $('#full-page-drop-zone').addClass('drag-over');
    };
    window.addEventListener("dragenter", this.dragenter);

    this.dragover = this.dragover || function(e) {
      if (e.target === Utils.lastDragTarget) {
        e.preventDefault();
      }
    };
    window.addEventListener("dragover", this.dragover);

    this.dragleave = this.dragleave || function(e) {
      if (e.target === Utils.lastDragTarget) {
        e.preventDefault();
        $('#full-page-drop-zone').removeClass('drag-over');
      }
    };
    window.addEventListener("dragleave", this.dragleave);

    this.drop = this.drop || function(e) {
      if (e.target === Utils.lastDragTarget) {
        e.preventDefault();
        $('#full-page-drop-zone').removeClass('drag-over');
        if (e.dataTransfer && e.dataTransfer.files) {
          cb && cb(e.dataTransfer.files);
        }
      }
    };
    window.addEventListener("drop", this.drop);
  },

  destroyFullPageDrop: function() {
    if (!this.fullPageDropInitialized) { return; }

    this.fullPageDropInitialized = false;
    window.removeEventListener('dragenter', this.dragenter);
    window.removeEventListener('dragover', this.dragover);
    window.removeEventListener('dragleave', this.dragleave);
    window.removeEventListener('drop', this.drop);
  },

  ownsDocument: function(userId, doc) {
    return doc && doc.attributes && doc.attributes.userId === userId;
  },

  isCreatingOwnDocument: function(userId, doc) {
    if (!userId) {
      throw new Meteor.Error(401, "You need to be logged in to create models.");
    } else if (!(doc && doc.attributes)) {
      throw new Meteor.Error(422, "Document must exist with attributes.");
    } else if (doc.attributes.userId !== userId) {
      throw new Meteor.Error(401, "You can only create models for your user.");
    } else {
      return true;
    }
  },

  generateColors: function(total) {
    var i = 360 / (total); // distribute the colors evenly on the hue range
    var colors = []; // hold the generated colors
    for (var x = 0; x < total; x++) {
      // you can also alternate the saturation and value for even more contrast between the colors
      colors.push('hsl(' + (i * x) + ',' + 100 + '%,' + 50 + '%)');
    }
    return colors;
  },

  log: function(text) {
    console.log("%c" + text, "color: orange;");
  },

  // throw error if template.data.propName DNE
  requireTemplateData: function(propName) {
    this.autorun(function() {
      var template = Template.instance();
      var data = template.data;
      var prop = data[propName];

      if (typeof prop === 'undefined' || prop === null) {
        throw new Error("Template '" + this.name + "' requires `data." + propName + "`");
        console.log('Data:', data);
      };
    });
  },

  // setup template to react to model
  initTemplateModel: function(propName, modelDidChange) {
    propName = propName || 'model';
    var prevModel;
    this.autorun(function() {
      var template = Template.instance();
      var data = Template.currentData();
      var newModel = data[propName];

      if (!newModel) {
        throw new Error("Template '" + this.name + "' given without a '" + propName + "'.", data);
        console.log('Data:', data);
      }

      if (newModel !== prevModel) {
        modelDidChange && modelDidChange.call(template, newModel, prevModel);
        prevModel = newModel;
      }
    });
  },

  // find all links to and from track a and track b
  // TODO: move this to track model
  findAllLinks: function(_idA, _idB) {
    if (!Tracks.findOne(_idA)) {
      return Links.find({
        $or: [{
          fromTrackId: _idB,
        }, {
          toTrackId: _idB,
        }]
      }).fetch();
    } else if (!Tracks.findOne(_idB)) {
      return Links.find({
        $or: [{
          fromTrackId: _idA,
        }, {
          toTrackId: _idA,
        }]
      }).fetch();
    } else {
      return Links.find({
        $or: [{
          fromTrackId: _idA,
          toTrackId: _idB,
        }, {
          fromTrackId: _idB,
          toTrackId: _idA,
        }]
      }).fetch();
    }
  },

  setMixPoint: function(mixPoint, inWave, outWave) {
    console.log("setting mix point", mixPoint, inWave.getMeta('title'), outWave.getMeta('title'));
    inWave.setMixOut(mixPoint._id, inWave);
    outWave.setMixIn(mixPoint._id);
    var mixOutRegion = inWave.getRegion(mixPoint._id);
    mixOutRegion.on('in', function() {
      inWave.pause();
      outWave.play(mixPoint.startOut);
    });
  },

  withErrorHandling: function(fn, name) {
    return function() {
      try {
        if (Session.get('debug')) {
          console.log("DEBUG: calling method '" + name + "' with args: ", arguments);
        }
        return fn.apply(this, arguments);
      } catch (error) {
        console.error(error.stack);
        if (this.fireEvent) {
          this.fireEvent('error', error && error.message || error);
        } else {
          throw error;
        }
      }
    };
  },

  // migrate transitions from linx meteor v1 to linx meteor v2
  migrateOldLinx: function() {
    var userId = Meteor.userId();
    if (!userId) {
      throw new Error("must be logged in to migrate old linx db")
    }

    var songs = Songs.find().fetch();
    var transitions = Transitions.find().fetch();

    // build tracks from songs
    songs.forEach(function(song) {
      var track = Tracks.create({
        isNew: false,
        _id: song._id,
        userId: userId,
        title: song.title || song.name,
        artist: song.artist,
        s3FileName: song._id + "." + song.fileType,
        type: "song",
        flags: [],
        playCount: song.playCount,
      });
      console.log("made song track", track);
    });


    // build tracks and links from transitions
    transitions.forEach(function(transition) {
      var fromTrack = Tracks.findOne(transition.startSong);
      var toTrack = Tracks.findOne(transition.endSong);

      // create transition track
      var transitionTrack = Tracks.create({
        isNew: false,
        _id: transition._id,
        userId: userId,
        title: fromTrack.get('title') + ' - ' + toTrack.get('title'),
        artist: transition.dj,
        s3FileName: transition._id + '.' + transition.fileType,
        type: "transition",
        flags: [],
        playCount: transition.playCount,
      });
      console.log("made transition track", transitionTrack);

      // create link from startSong -> transition
      var link1 = Links.create({
        isNew: false,
        userId: userId,

        fromTrackId: transition.startSong,
        toTrackId: transition._id,

        fromTime: transition.startSongEnd,
        toTime: transition.startTime,

        fromVol: transition.startSongVolume,
        toVol: transition.volume,

        playCount: transition.playCount,        
      });
      console.log("made link1", link1);

      // create link from transition -> endSong
      var link2 = Links.create({
        isNew: false,
        userId: userId,

        fromTrackId: transition._id,
        toTrackId: transition.endSong,

        fromTime: transition.endTime,
        toTime: transition.endSongStart,

        fromVol: transition.volume,
        toVol: transition.endSongVolume,

        playCount: transition.playCount,
      });
      console.log("made link2", link2);

    });

  }
};
