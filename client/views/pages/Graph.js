/** @jsx React.DOM */
var React = require('react');
var Backbone = require('backbone');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/Graph')

var _ = require('underscore');
var $ = jQuery = require('jquery');
var d3 = require('d3');
require('jquery-overscroll');

var Track = require('../../models/Track');
var Node = require('../../models/Node');
var Tracks = require('../../collections/Tracks');
var Nodes = require('../../collections/Nodes');

module.exports = React.createClass({
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'width': 160,
      'height': 100,
    };
  },

  render: function () {
    return (<svg id="graph">
    </svg>);
  },  
      //<rect x="0" y="0" width="100" height="100" fill="yellow" stroke="black" stroke-width="12"/>

  componentDidMount: function () {
    var width = this.props.width;
    var height = this.props.height;

    //
    // initialize svg
    //

    var svg = this.svg = d3.select("#graph")
      // TODO: make viewBox from props.width/height
      .attr('viewBox', '0 0 160 100')
      .attr('preserveAspectRatio', 'none');

    // build arrows
    svg.append("svg:defs").selectAll("marker")
      .data(["end"])
      .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 2.5)
      .attr("markerHeight", 2.5)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

    //
    // initialize nodes and links
    //

    var nodes = this.props.nodes;
    var links = this.props.links;

    // add references
    nodes.setSVG(svg, width, height);
    links.setSVG(svg, width, height);
    links.setNodes(nodes);

    // init active and playing
    this.updatePlaying();
    this.updateActive();

  },

  componentDidUpdate: function (prevProps, prevState) {
    // TODO: need to change setActiveTrack on mix change!

    // update active if changed
    var active = this.props.active;
    var prevActive = prevProps.active;
    if (!active || (active.id !== prevActive.id)) {
      this.updateActive();
    }

    // update playing if changed
    var playing = this.props.playing;
    var prevPlaying = prevProps.playing;
    if (!playing || (playing.id !== prevPlaying.id)) {
      this.updatePlaying();
    }

  },

  // TODO: RETHINK THIS
  'updateActive': function (prevActive) {
    // place activeTrack in center of screen
    var active = this.props.active;
    debug("updating active", active);
    if (active) {
      switch (active.get('linxType')) {
        case 'song': 
          active.set({
            'x': this.props.x0,
            'px': active.get('x'),
            'y': this.props.y0,
            'py': active.get('y'),
            'color': 2,
            'pColor': active.get('color'),
          });
          break;
        // TODO: make this also do stuff for transition
        case 'transition':
          debug("WARNING: active is transition!");
          break;
      }
    }
    if (prevActive) {
      switch (prevActive.get('linxType')) {
        case 'song': 
          prevActive.set({
            'x': prevActive.get('px'),
            'y': prevActive.get('py'),
            'color': prevActive.get('pColor'),
          });
          break;
        // TODO: make this also do stuff for transition
        case 'transition':
          debug("WARNING: prevActive is transition!");
          break;
      }
    }
  },

  // TODO: RETHINK THIS
  'updatePlaying': function (prevPlaying) {
    var playing = this.props.playing;
    debug("updating playing", playing);
    // color playingTrack blue
    if (playing) {
      playing.set({
        'color': 2,
        'pColor': playing.get('color'),
      });
    }
    if (prevPlaying) {
      prevPlaying.set({
        'color': prevPlaying.get('pColor'),
      });
    }
  },

  // TODO: RETHINK THIS
  makeTrackElement: function (track) {
    debug("MAKING TRACK ELEMENT", track);
    if (!track) { return null; }
    // make new element from track
    switch (track.get('linxType')) {
      case 'song':
        return new Node({
          'track': track,
          'id': track.id,
          'x': -10,
          'y': -10,
          'linxType': 'song',
        });
        break;
      case 'transition':
        return new Link({
          'track': track,
          'id': track.id,
          'linxType': 'transition',
        });
        break;
    }
  },

  // TODO: RETHINK THIS
  getTrackElement: function (track) {
    debug("GETTING TRACK ELEMENT", track);
    if (!track) { return null; }
    // TODO: rethink this
    var queue = this.props.queue;
    var upNext = this.props.upNext;
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
    // get (or make) and return element
    var element = queue[elType].get(track.id) ||
      upNext[elType].get(track.id);
    if (!element) {
      element = this.makeTrackElement(track);
    }
    return element;
  },

});