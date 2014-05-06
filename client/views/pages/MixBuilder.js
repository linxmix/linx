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
    }
  },

  getInitialState: function () {
    return {
      'queue': {
        'nodes': new Nodes(),
        'links': new Links(),
      },
      'upNext': {
        'nodes': new Nodes(),
        'links': new Links(),
      },
    };
  },

  songsUpNext: function (outSong) {
    var searchResults = this.props.searchResults;
    var songs = searchResults.tracks().slice(0, 4);
    // make soft transitions into song
    var transitions = songs.map(function (inSong) {
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
    debug("COMPUTE UP NEXT");
    var mix = this.props.viewingPlaylist;
    if (mix && mix.get('type') === 'mix') {
      var activeTrack = mix.getActiveTrack();
      if (activeTrack) {
        var upNext;
        // determine upNext based on track type
        switch (activeTrack.get('linxType')) {
          case 'song':
            upNext = this.songsUpNext(activeTrack);
            break; // TODO: make graph flower
          case 'transition':
           upNext = this.transitionsUpNext(activeTrack);
            break; // TODO: make graph lines
        }
        // update based on new upNext
        this.setState({
          'upNext': {
            'nodes': Nodes.makeFromTracks(upNext.songs),
            'links': Links.makeFromTracks(upNext.transitions),
          },
        });
      }
    }
  },

  decomposeQueue: function () {
    debug("DECOMPOSE QUEUE");
    var mix = this.props.viewingPlaylist;
    if (mix) {
      var songs = mix.getSongs();
      var transitions = mix.getTransitions();
      this.setState({
        'queue': {
          'nodes': Nodes.makeFromTracks(songs.models),
          'links': Links.makeFromTracks(transitions.models),
        },
      });
    }
  },

  getTrackElement: function (track) {
    if (!track) { return null; }
    var queue = this.state.queue;
    var upNext = this.state.upNext;
    var elType;
    // determine element type from type of track
    switch (track.get('linxType')) {
      case 'song':
        elType = 'nodes';
        break;
      case 'transition':
        elType = 'links';
        break;
    }
    // get and return element
    var element = queue[elType].get(track.id) ||
      upNext[elType].get(track.id);
    if (!element) {
      //throw new Error("getTrackElement found no element for given track!");
    }
    return element;
  },

  render: function () {
    var mix = this.props.viewingPlaylist;
    var graph;
    if (mix && mix.get('type') === 'mix') {
      active = this.getTrackElement(mix.getActiveTrack());
      // TODO: playing can be a transition!
      playing = this.getTrackElement(mix.get('playingTrack'));
      graph = Graph({
        'active': active,
        'playing': playing,
        'queue': this.state.queue,
        'upNext': this.state.upNext,
        'setActiveTrack': mix.setActiveTrack.bind(mix),
        'playViewing': this.props.playViewing,
        'playpauseViewing': this.props.playpauseViewing,
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
        this.decomposeQueue);
      listener.listenTo(tracks, 'remove',
        this.decomposeQueue);
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
    this.stopListening(prevMix);
    this.decomposeQueue();
    this.listenTo(this.props.viewingPlaylist);
  },

  componentDidMount: function () {
    this.resetListener();
    this.listenToSearch();
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