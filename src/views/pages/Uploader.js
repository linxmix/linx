/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/Uploader')

var _ = require('underscore');

var Track_Uploader = require('../track/Track_Uploader');
var Dropzone = require('./Uploader/dropzone');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function () {
    return {};
  },

  updateSelection: function (track, selection) {
    var newState = {};
    newState[track.cid] = selection;
    this.setState(newState);
  },

  // compares the selected regions of the two analyzed tracks
  // to the end of finding places where they most exactly overlap

  // TODO: sort matches by similarity of nearby segments
  compare: function () {
    var uploaderSongs = this.props.uploaderPlaylist.getSongs();
    var track1 = uploaderSongs.at(0);
    var track2 = uploaderSongs.at(1);
    var selection1 = [track1, this.state[track1.cid]];
    var selection2 = [track2, this.state[track2.cid]];
    debug("comparing regions", selection1, selection2);

    // determine valid segments for each track
    var thresh = 0.5;
    var t1Analysis = track1.get('echoAnalysis');
    var t1Start = selection1[1]['startPosition'];
    var t1End = selection1[1]['endPosition'];
    var t1Segs = _.filter(t1Analysis['segments'], function (seg) {
      var confident = (seg['confidence'] >= thresh);
      var inRegion = (seg['start'] >= t1Start) &&
        (seg['start'] <= t1End);
      return inRegion && confident;
    });
    debug("track1 Segs", t1Segs);
    var t2Analysis = track2.get('echoAnalysis');
    var t2Start = selection2[1]['startPosition'];
    var t2End = selection2[1]['endPosition'];
    var t2Segs = _.filter(t2Analysis['segments'], function (seg) {
      var confident = (seg['confidence'] >= thresh);
      var inRegion = (seg['start'] >= t2Start) &&
        (seg['start'] <= t2End);
      return inRegion && confident;
    });
    debug("track2 Segs", t2Segs);

    // compare segments and return possible matches
    var matches = [];
    t1Segs.forEach(function (t1Seg) {
      t2Segs.forEach(function (t2Seg) {
        // compute distance between segs
        matches.push({
          'seg1': t1Seg['start'],
          'seg2': t2Seg['start'],
          'dist': euclidean_distance(t1Seg.timbre, t2Seg.timbre),
        });
      });
    });

    // sort matches and take only the top 5
    matches = _.sortBy(matches, function (match) {
      return match['dist'];
    });
    best_matches = matches.splice(0, Math.min(5, t1Segs.length, t2Segs.length));
    debug("best_matches", best_matches);

    // add matched segs as marks to waveforms
    t1Matches = best_matches.map(function (match) {
      return match['seg1'];
    });
    track1.set({ 'matches': t1Matches });
    t2Matches = best_matches.map(function (match) {
      return match['seg2'];
    });
    track2.set({ 'matches': t2Matches });
    this.forceUpdate();


    /*uploaderTracks.forEach(function (track) {
      var selection = this.state[track.cid];
      debug("TRACK SELECTION", track.get('title'), selection);

    }.bind(this));*/
  },

  onTransitionDrop: function(files) {
    console.log('onTransitionDrop', files[0]);
  },

  render: function () {

    // make a Track_Uploader for every track
    var tracks = this.props.uploaderPlaylist.tracks().map(function (track) {
      return Track_Uploader({
        'track': track,
        'dragSelection': true,
        'onUpdateSelection': this.updateSelection,
        'changePlayState': this.props.changePlayState,
      });
    }.bind(this));

    // make dropzone
    var dropzone = Dropzone({
      'onDrop': this.onTransitionDrop,
    });

    return (
      <div>
        <div className="inverted ui segment">
          {dropzone}
        </div>
        <div className="ui small buttons">
          <div className="ui black button" onClick={this.compare}>
            Compare Selections
          </div>
        </div>
        {tracks}
      </div>
    );
  },

});

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
