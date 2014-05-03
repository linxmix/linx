/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/MixBuilder')

var _ = require('underscore');

var Graph = require('./Graph');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  // determine which songs and transitions are upNext
  // TODO: port this idea
  /*
  'computeUpNext': function() {
    var queuedSongs = Graph['queuedSongs'];
    var lastSong = queuedSongs[queuedSongs.length - 1]
    var queuedSongIds = queuedSongs.map(function (song) {
      return song._id;
    });
    // find all transitions out of lastSong
    var startTime = (lastSong._id === Graph['currSong']._id) ?
        Mixer.getCurrentPosition() : lastSong.startTime;
    Graph['transitionsUpNext'] = Transitions.find({
      'startSong': lastSong._id,
      'startSongEnd': { $gt: startTime },
      // exclude songs already in the queue
      'endSong': { $nin: queuedSongIds }
    }).fetch();
    // add endSong of each transition to upNext
    Graph['upNext'] =
      Graph['transitionsUpNext'].map(function (transition) {
        var song = Songs.findOne(transition.endSong);
        song['transition'] = transition;
        return song;
    });
  },*/

  render: function () {
    var options = {};

    // TODO: make this work, including stuff like:
    /*
      'currSong': null,
      'queuedSongs': [],
      'queuedTransitions': [],
      'upNext': [],
      'transitionsUpNext': [],
      'nodes': [],
      'links': [],
      'width': 0,
      'height': 0,
      'x0': 0,
      'y0': 0,
      'r': 0,
      'svg': null,
      // set graph width and height to be that of client's screen
      var width = this.width = $(window).width() - 50;
      var height = this.height = $(window).height() - 96;
      this.x0 = width / 2.0;
      this.y0 = height / 2.0;
      this.r = height / 2.5;
      this.$('#graph').width(width);
      this.$('#graph').height(height);
      */
    // determine vars for graph

    return (
    <div>
      <div className="graph-wrapper">
        {Graph(_.defaults(options, this.props))}
      </div>
    </div>
    );
  },

});