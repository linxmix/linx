var Linx = require('../../');

module.exports = Linx.module('Players.Tracks',
  function (Tracks, App, Backbone, Marionette, $, _) {

  Tracks.Track = Backbone.Model.extend({

    'defaults': function () {
      var order = App.Players.player.trackList.nextOrder();
      return {
        '_id': Math.uuid(),
        'type': 'track',
        'order': order,
        'pos': 0, // internal track position
        'rate': 1, // track playback rate
        'lastPlayTime': undefined, // absolute time of last play, or undefined if paused
      };
    },

    'initialize': function () {
      if (debug) {
        console.log('initing track', this);
        this.on('all', function (name) {
          console.log("track event: ", arguments);
        });
      }
      Backbone.Model.prototype.initialize.apply(this, arguments);

      // track is ready after its clipList is ready
      var defer = $.Deferred();
      this.ready = defer.promise();

      // dynamically generate pouch function
      var makePouch = function (track) {
        return {
          'listen': true,
          'fetch': 'query',
          'options': {
            'query': {
              'include_docs': true,
              'key': track.id,
              'fun': {
                'map': function (doc) {
                  if (doc.type === 'clip') {
                    emit(doc.trackId, null);
                  }
                },
              },
            },
            'changes': {
              'include_docs': true,
              'query_params': {
                'trackId': track.id,
              },
              'filter': function(doc, req) {
                return doc._deleted || (doc.type === 'clip' && doc.trackId === req.query.trackId);
              },
            },
          },
        }
      };

      var TrackClipList = Tracks.Clips.ClipList.extend({
        'pouch': makePouch(this),
      })
      this.clipList = new TrackClipList();

      var self = this;
      $.when(self.clipList.ready).done(function() {
        // setup events for each clip
        _.each(self.clipList.models, function (clip) { self.setupClipListens(clip); });
        if (debug) console.log("track ready", self);
        defer.resolve();
      });
    },

    'play': function (time) {
      if (debug) { console.log("playing track", this); }
      // play head clip if there is one
      var headClip = this.getHeadClip();
      (headClip && headClip.play(this.get('pos')));
      // update track's lastPlayTime
      this.set('lastPlayTime', App.audioContext.currentTime);
    },

    'pause': function () {
      if (debug) { console.log("pausing track", this); }
      // pause head clip if there is one
      var headClip = this.getHeadClip();
      (headClip && headClip.pause());
      // update track's pos and lastPlayTime
      this.set('pos', this.getPos());
      this.set('lastPlayTime', undefined);
    },

    'stop': function () {
      if (debug) { console.log("stopping track", this); }
      // stop head clip if there is one
      var headClip = this.getHeadClip();
      (headClip && headClip.stop());
      // update track's pos and lastPlayTime
      this.set('pos', 0);
      this.set('lastPlayTime', undefined);
    },
    
    // returns the next clip in line to be played
    // TODO: make this return appropriate clip, and only if it's at the right pos
    'getHeadClip' : function () {
      return this.clipList.models[0];
    },

    // returns track position in track time domain
    'getPos': function () {
      var lastPlayTime = this.get('lastPlayTime');
      var pos = this.get('pos');
      // account for progress since last play
      if (typeof lastPlayTime !== 'undefined') {
        pos += (App.audioContext.currentTime - lastPlayTime);
      }
      return pos;
    },

    'getClipPos': function (clip) {
      if (clip) {
        var clipPos = this.getPos() - clip.get('trackPos');
        if (debug) console.log("getClipPos", clipPos, clip);
        return clipPos;
      } else {
        console.log("WARNING: Track.getClipPos called without a clip");
        return 0;
      }
    },

    'getTimeRemaining': function () {
      return (this.getDuration() - this.getPos());
    },

    // TODO: make this return endTime of last clip
    'getDuration': function () {
      var headClip = this.getHeadClip();
      return (headClip ? headClip.getDuration() : 0);
    },

    // TODO
    'jump': function () {},
    'loop': function () {},

    'queue': function (source) {
      if (debug) { console.log("track queuing source", this, source); }
      var self = this;
      self.clipList.create({
        'source': source,
        'trackId': self.get('_id'),
      }, {
        'success': function (clip) {
          self.setupClipListens(clip);
        },
        'error': function (error) {
          throw error;
        },
      });
    },

    'setupClipListens': function (clip) {
      if (debug) console.log("track setting events for clip", this, clip);

      // when clip seeks, serve as track seek
      var self = this;
      this.listenTo(clip, 'seek', function (percent) {
        // seek track
        var clipStartPos = self.getClipPos(clip);
        var clipEndPos = clip.getDuration() * percent;
        var distJumped = clipEndPos - clipStartPos;
        if (debug) console.log("clipSeek jumped track by "+distJumped);
        var newPos = self.get('pos') + distJumped;
        self.set('pos', newPos);
        // trigger track seek event
        self.trigger('seek', (newPos / self.getDuration()));
      });

    },

    // TODO: move this into collection
    'destroyClips': function () {
      var self = this;
      var clips = this.clipList.models.slice();
      _.each(clips, function (clip) {
        clip.destroy();
      });
    },

    'destroy': function () {
      if (debug) console.log("destroying track", this);

      // before this track is destroyed, destroy all its clips
      this.destroyClips();
      // destroy this track
      Backbone.Model.prototype.destroy.call(this);
    },

  });
});