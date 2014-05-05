/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var Backbone = require('Backbone');
var debug = require('debug')('views:pages/MixBuilder')

var _ = require('underscore');

var Graph = require('./Graph');
var Nodes = require('../../collections/Nodes');
var Links = require('../../collections/Links');

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

  computeUpNext: function () {
    var mix = this.props.viewingPlaylist;
    var activeTrack = mix.getActiveTrack();
    switch (activeTrack['linxType']) {
      case 'song': break; // TODO: make graph flower
      case 'transition': break; // TODO: make graph lines
    }
    // TODO: set nodes and links of upNext
    throw new Error("computeUpNext incomplete!");
    var songs; var transitions;
    this.setState({
      'upNext': {
        'nodes': new Nodes(songs.pluck('id')),
        'links': new Links(transitions.forEach(function (transition) {
          return {
            'id': transition.id,
            'transitionType': transition.transitionType,
          }
        })),
      },
    });
  },

  decomposeQueue: function () {
    var mix = this.props.viewingPlaylist;
    if (mix) {
      var songs = mix.getSongs();
      var transitions = mix.getTransitions();
      debug("DECOMPOSING QUEUE", mix, songs, transitions)
      this.setState({
        'queue': {
          'nodes': new Nodes(songs.pluck('id')),
          'links': new Links(transitions.forEach(function (transition) {
            return {
              'id': transition.id,
              'transitionType': transition.transitionType,
            }
          })),
        },
      });
    }
  },

  render: function () {
    var mix = this.props.viewingPlaylist;
    var queue = this.state.queue;
    var upNext = this.state.upNext;
    var active, playing;
    if (mix && mix.type === 'mix') {
      active = queue.nodes.get(mix.getActiveTrack());
      playing = queue.links.get(mix.get('playingTrack'));
    }
    return (
    <div className="ui segment">
      <div className="graph-wrapper">
        {Graph({
          'active': active,
          'playing': playing,
          'queue': queue,
          'upNext': upNext,
        })}
      </div>
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

  stopListening: function (mix) {
    if (mix) {
      var listener = this.props.listener;
      var tracks = mix.tracks();
      listener.stopListening(mix);
      listener.stopListening(tracks);
    }
  },

  resetListener: function (prevMix) {
    this.stopListening(prevMix);
    this.decomposeQueue();
    this.listenTo(this.props.viewingPlaylist);
  },

  componentDidMount: function () {
    this.resetListener();
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
    this.stopListening(this.props.viewingPlaylist);
  },

});