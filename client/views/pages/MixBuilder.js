/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var Backbone = require('backbone');
var debug = require('debug')('views:pages/MixBuilder')

var _ = require('underscore');
var $ = require('jquery');

var Graph = require('./Graph');

var Nodes = require('../../collections/Nodes');
var Links = require('../../collections/Links');

var Transition_Soft = require('../../models/Transition_Soft');
var Node = require('../../models/Node');
var Link = require('../../models/Link');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'listener': _.extend({}, Backbone.Events),
      'nodes': new Nodes(),
      'links': new Links(),
    }
  },

  songsUpNext: function (inSong) {
    var searchResults = this.props.searchResults;
    var songs = searchResults.tracks().slice(0, 7);
    // make soft transitions into song
    debug("computing Songs UP NEXT", inSong);
    var transitions = songs.map(function (outSong) {
      return new Transition_Soft({
        'in': inSong.id,
        'out': outSong.id,
      });
    });
    return {
      'songs': songs,
      'transitions': transitions,
    }
  },

  transitionsUpNext: function (transition) {
    throw new Error("transitionsUpNext unimplemented!");
    return {
      'songs': {},
      'transitions': {},
    }
  },

  computeUpNext: function () {
    var mix = this.props.viewingPlaylist;
    if (mix && mix.get('type') === 'mix') {
      var activeTrack = mix.getActiveTrack();
      if (activeTrack) {
        var upNextTracks;
        // determine upNextTracks based on track type
        switch (activeTrack.get('linxType')) {
          case 'song':
            upNextTracks = this.songsUpNext(activeTrack);
            break;
          case 'transition':
            upNextTracks = this.transitionsUpNext(activeTrack);
            break;
        }
        // update based on new upNextTracks
        this.props.nodes.mergeUpNext(upNextTracks.songs);
        this.props.links.mergeUpNext(upNextTracks.transitions);
      }
    }
  },

  computeQueue: function () {
    var mix = this.props.viewingPlaylist;
    if (mix) {
      this.props.nodes.mergeQueue(mix.getSongs().models);
      this.props.links.mergeQueue(mix.getTransitions().models);
    }
  },

  render: function () {
    var mix = this.props.viewingPlaylist;
    var graph;
    if (mix && mix.get('type') === 'mix') {
      graph = Graph({
        'active': mix.getActiveTrack(),
        'playing': mix.get('playingTrack'),
        'nodes': this.props.nodes,
        'links': this.props.links,
      });
    }
    return (
    <div className="graph-wrapper">
      {graph}
    </div>
    );
  },

  listenTo: function (mix) {
    if (mix) {
      var listener = this.props.listener;
      // need to wrap so calls with no args
      var forceUpdate = function () {
        this.forceUpdate();
      }.bind(this);
      // listen to mix
      listener.listenTo(mix, 'change:activeTracks',
        this.computeUpNext);
      listener.listenTo(mix, 'change:playingTrack',
        forceUpdate);
      // listen to tracks
      var tracks = mix.tracks();
      listener.listenTo(tracks, 'add',
        this.computeQueue);
      listener.listenTo(tracks, 'remove',
        this.computeQueue);
    }
  },

  listenToSearch: function () {
    var searchResults = this.props.searchResults;
    var listener = this.props.listener;
    listener.listenTo(searchResults, 'change:tracks',
      this.computeUpNext);
  },

  stopListening: function (mix, searchResults) {
    var listener = this.props.listener;
    if (mix) {
      var tracks = mix.tracks();
      listener.stopListening(mix);
      listener.stopListening(tracks);
    }
    if (searchResults) {
      listener.stopListening(searchResults);
    }
  },

  resetListener: function (prevMix) {
    var newMix = this.props.viewingPlaylist;
    this.stopListening(prevMix);
    // update nodes's reference to mix
    this.props.nodes.mix = mix;
    this.computeQueue();
    this.listenTo(newMix);
  },

  componentDidMount: function () {
    this.resetListener();
    this.listenToSearch();
    // add props to nodes
    var nodes = this.props.nodes;
    nodes.play = this.props.playViewing;
    nodes.playpause = this.props.playpauseViewing;
  },

  componentDidUpdate: function (prevProps, prevState) {
    var prevMix = prevProps.viewingPlaylist;
    var mix = this.props.viewingPlaylist;
    // switch mix listener if mix changed
    if (mix && ((prevMix && prevMix.cid) !== mix.cid)) {
      this.resetListener(prevMix);
    }
  },

  componentWillUnmount: function () {
    this.stopListening(this.props.viewingPlaylist,
      this.props.searchResults);
  },

});