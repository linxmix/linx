/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/MixBuilder')

var _ = require('underscore');

var Graph = require('./Graph');
var Nodes = require('../../collections/Nodes');
var Links = require('../../collections/Links');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function () {
    this.decomposeQueue();
    return { };
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
    var songs = mix.getSongs();
    var transitions = mix.getTransitions();
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
  },

  render: function () {
    var mix = this.props.viewingPlaylist;
    var queue = this.state.queue;
    var upNext = this.state.upNext;
    var active = queue.get(mix.getActiveTrack());
    var playing = queue.get(mix.get('playingTrack'));
    return (
    <div>
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

  resetListener: function (prevMix) {
    // remove handlers from prevMix
    if (prevMix) {
      if (this.onMixChange) {
        prevMix.offEvents(this.onMixChange);
      }
      if (this.onActiveChange) {
        prevMix.offEvents(this.onActiveChange);
      }
      if (this.onPlayingChange) {
        prevMix.offEvents(this.onPlayingChange);
      }
    }
    // recalculate on changes
    var onMixChange = this.onMixChange || function onMixChange(newTrack) {
      debug('onMixChange', this, newTrack);
      this.decomposeQueue();
    }.bind(this);
    var onActiveChange = this.onActiveChange || function onActiveChange(newTrack) {
      debug('onActiveChange', this, newTrack);
      this.computeUpNext();
    }.bind(this);
    var onPlayingChange = this.onPlayingChange || function onPlayingChange(newTrack) {
      debug('onPlayingChange', this, newTrack);
      this.forceUpdate();
    }.bind(this);
    // add handlers to new mix
    var mix = this.props.viewingPlaylist;
    if (mix) {
      mix.onEvents(onMixChange, ['add', 'remove']);
      mix.onEvents(onActiveChange, ['change:activeTrack']);
      mix.onEvents(onPlayingChange, ['change:playingTrack']);
    }
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

});