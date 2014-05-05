/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/MixBuilder')

var _ = require('underscore');
var $ = jQuery = require('jquery');
var d3 = require('d3');
require('jquery-overscroll');

// TODO: make it so links are drawn naturally instead of in tick
// TODO: fix linx map view, broken because using "x" instead of "px"?
// TODO: update positions when song changes

module.exports = React.createClass({
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    var width = 160;
    var height = 100;
    return {
      'width': width,
      'height': height,
      'x0': width / 2.0,
      'y0': height / 2.0,
      'r': height / 2.5,
    }
  },

  render: function () {
    return (<svg id="graph">
    </svg>);
  },
      //<rect x="0" y="0" width="100" height="100" fill="yellow" stroke="black" stroke-width="12"/>

  componentDidMount: function () {
    debug("OVERSCROLL", jQuery.fn.overscroll);

    // create svg
    var svg = this.svg = d3.select("#graph")
      .attr('viewBox', '0 0 160 100')
      .attr('preserveAspectRatio', 'none')

    // build arrows
    svg.append("svg:defs").selectAll("marker")
      .data(["end"])
      .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

    // update graph
    this.updateQueue();
    this.updateUpNext();
    this.updateNodes();
    this.updateLinks();
    this.updatePlaying();
    this.updateActive();

  },

  componentDidUpdate: function (prevProps, prevState) {
    var prevUpNext = prevProps.upNext;
    var upNext = this.props.upNext;
    var prevQueue = prevProps.queue;
    var queue = this.props.queue;
    var prevPlaying = prevProps.playing;
    var playing = this.props.playing;
    var prevActive = prevProps.active;
    var active = this.props.active;
    // see if things changed
    var upNextNodes = (prevUpNext.nodes !== upNext.nodes);
    var upNextLinks = (prevUpNext.links !== upNext.links);
    var queueNodes = (prevQueue.nodes !== queue.nodes);
    var queueLinks = (prevQueue.links !== queue.links);
    debug("GRAPH UPDATE", queueNodes, queueLinks);

    // update if upNext changed
    if (upNextNodes || upNextLinks) {
      this.updateUpNext();
    }
    // update if queue changed
    if (queueNodes || queueLinks) {
      this.updateQueue();
    }
    // update if nodes changed
    if (upNextNodes || queueNodes) {
      this.updateNodes();
    }
    // update if links changed
    if (upNextLinks || queueLinks) {
      this.updateLinks();
    }
    // update if playing changed
    if (playing) {
      this.updatePlaying();
    }
    // update if active changed
    if (active) {
      this.updateActive();
    }
  },

  // TODO: make this also do stuff for transition
  'updateActive': function () {
    // place activeTrack in center of screen
    var active = this.props.active;
    debug("UPDATING ACTIVE", active);
    if (active) {
      active.set({
        'x': this.props.x0,
        'y': this.props.y0,
      });
    }
  },

  // color playingTrack blue
  'updatePlaying': function () {
    var playing = this.props.playing;
    debug("UPDATING PLAYING", playing);
    if (playing) {
      playing.set({ 'color': 2 });
    }
  },

  // place and color queued songs
  'updateQueue': function () {
    var nodes = this.props.queue['nodes'];
    debug("UPDATING QUEUE", nodes);
    var width = this.props.width;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes.at(i);
      node.set({
        'x': 5,
        'y': 5 * i + 5,
        'color': 1,
      });
    }
  },

  // place upNext songs in a circle around lastSong
  'updateUpNext': function () {
    var nodes = this.props.upNext['nodes'];
    debug("UPDATING UPNEXT", nodes);
    var x0 = this.props.x0;
    var y0 = this.props.y0;
    var r = this.props.r;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes.at(i);
      var theta = (i / nodes.length) * (2.0 * Math.PI);
      node.set({
        'x': x0 + r * Math.cos(theta),
        'y': y0 + r * Math.sin(theta),
        'color': 0,
      });
    }
  },

  // sync displayed svg with node data
  'updateNodes': function () {
    var queueNodes = _.pluck(this.props.queue.nodes.models, 'attributes');
    var upNextNodes = _.pluck(this.props.upNext.nodes.models, 'attributes');
    var nodes = queueNodes.concat(upNextNodes);
    debug("UPDATE NODES", nodes)

    //
    // JOIN new data to old nodes using id as the key
    //
    var node = this.svg.selectAll(".node")
      // TODO: does this update existing models with new
      //       data? even when changed by 'set'?
      .data(nodes, function (d) { return d.id; });

    // 
    // ENTER new data as new nodes
    //
    var enter = node.enter().append("svg:g")
      .attr("class", "node")
      // initial position
      .attr("transform", function(d) {
        var x = this.width / 2;
        var y = 0;
        return "translate(" + x + "," + y + ")";
      }.bind(this))
      // TODO: play or queue node on double click
      .on("dblclick", function (d) {
        debug("dblclick", d);
      }.bind(this));

    // animate flying in
    enter.transition(1000)
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    // add the circles
    enter.append("circle")
      .attr("r", 2)
      // TODO: can style inherit from properites of d?
      .style("fill", colorNode)
      // color and grow node on mouseover
      .on("mouseover", function (d) {
        var color = 1;
        d3.select(this).transition()
          .duration(300)
          .attr("r", 3)
          .style("fill", function (d) { return colorNode({ color: color }); });
      })
      .on("mouseout", function (d) {
        d3.select(this).transition()
          .duration(300)
          .attr("r", 2)
          .style("fill", colorNode);
      });

    // add the text 
    enter.append("text")
      .attr("x", 1)
      .attr("dy", ".35em")
      //.text(function(d) { return d.title; });

    // 
    // UPDATE existing nodes
    // 
    node.transition()
      .duration(1000)
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .select("circle")
      // recolor node's circle
      .style("fill", colorNode);

    //
    // EXIT old nodes
    //
    node.exit()
      .remove();

  }, // /end updateNodes

  // sync displayed svg with link data
  'updateLinks': function () {
    var queueLinks = _.pluck(this.props.queue.links.models, 'attributes');
    var upNextLinks = _.pluck(this.props.upNext.links.models, 'attributes');
    var links = queueLinks.concat(upNextLinks);
    debug("UPDATE LINKS", links)

    //
    // JOIN new data to old links using id as the key
    //
    var path = this.svg.selectAll(".link")
      .data(links, function (d) { return d.id; });

    //
    // ENTER new data as new links
    //
    path.enter().append("svg:path")
      .attr("class", "link")
      // make soft transitions dashed
      .style("stroke-dasharray", function (d) {
        return ((d.transitionType !== 'soft') ? "" : ("3,3"));
      })
      // add link's arrow
      .attr("marker-end", "url(#end)")
      .style("stroke", colorLink);

      // TODO: fix this. problem is finding source and target x and y.
      /*.attr("d", function(d) {
        console.log("drawing path", d);
        // draw path
        var startSong = Graph.nodes[d['startSong']];
        var endSong = Graph.nodes[d['endSong']];
        var dx = endSong.x - startSong.x,
        dy = endSong.y - startSong.y,
        dr = Math.sqrt(dx * dx + dy * dy);
        return "M" +
        d.source.x + "," +
        d.source.y + "A" +
        dr + "," + dr + " 0 0,1 " +
        d.target.x + "," +
        d.target.y;
      });*/

    //
    // EXIT old links
    //
    path.exit()
      .remove();

  }, // /end updateLinks

});


//
// Utility Functions
//

function colorNode(d) {
  var colors = ["#ff0000", "#00ff00", "#0000ff"], // red, green, blue
      color = (d && d.color) || 0;
  return colors[color];
}

function colorLink(d) {
  var colors = ["#666", "#2ca02c", "#1f77b4"], // red, green, blue
      color = (d && d.color) || 0;
  return colors[color];
}

// add the curvy lines
function tick() {
  Graph.svg.selectAll(".link").attr("d", function(d) {

    /*
    // recenter path's circle
    var pathSel = d3.select(this);
    var pathEl = d3.select(this).node();
    var midPoint = pathEl.getPointAtLength(pathEl.getTotalLength()/2.0);
    pathSel.select("circle")
    .attr("r", 50)
    .attr("cx", midPoint.x)
    .attr("cy", midPoint.y);
    console.log(pathSel.select("circle").node());
    */        

    // redraw path
    var dx = d.target.x - d.source.x,
    dy = d.target.y - d.source.y,
    dr = Math.sqrt(dx * dx + dy * dy);
    return "M" +
    d.source.x + "," +
    d.source.y + "A" +
    dr + "," + dr + " 0 0,1 " +
    d.target.x + "," +
    d.target.y;
  });

  this.svg.selectAll(".node").attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}