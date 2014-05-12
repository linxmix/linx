/** @jsx React.DOM */
var React = require('react');
var Backbone = require('backbone');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/Graph')

var _ = require('underscore');
var d3 = require('d3');

// necessary for overscroll
var $ = jQuery = require('jquery');
require('jquery-overscroll');

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
    };
  },

  onNodeClick: function (d, i) {
    debug("onClick", arguments)
    this.props.setActiveTrack(d.track);
  },

  onNodeDblClick: function (d, i) {
    debug("onDblClick", arguments)
    this.props.play(null, {
      'track': d.id,
    });
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

    this.props.nodes.setDimensions(width, height);
    this.props.links.setDimensions(width, height);

    this.updateLinks();
    this.updateNodes();

    // init active and playing
    // TODO: find out how to do this after computing upNext and queue
    //this.updatePlaying();
    //this.updateActive();

  },

  componentWillUpdate: function (nextProps, nextState) {

    // update active if changing
    var active = this.props.active;
    var nextActive = nextProps.active;
    if (!nextActive ||
      (nextActive.id !== (active && active.id))) {
      this.updateActive(nextActive);
    }

    // update playing if changing
    var playing = this.props.playing;
    var nextPlaying = nextProps.playing;
    if (!nextPlaying ||
      (nextPlaying.id !== (playing && playing.id))) {
      this.updatePlaying(nextPlaying);
    }

  },

  componentDidUpdate: function () {
    // update nodes and links
    this.updateLinks();
    this.updateNodes();
  },

  updateActive: function (nextActive) {
    debug("updating active", nextActive);
    var nodes = this.props.nodes;
    var links = this.props.links;
    if (nextActive) {
      switch (nextActive.get('linxType')) {
        case 'song':
          nodes.setActive(nextActive);
          links.setActive();
          break;
        case 'transition':
          nodes.setActive();
          links.setActive(nextActive);
          break;
      }
    }
  },

  updatePlaying: function (nextPlaying) {
    debug("updating playing", nextPlaying);
    var nodes = this.props.nodes;
    var links = this.props.links;
    if (nextPlaying) {
      switch (nextPlaying.get('linxType')) {
        case 'song':
          nodes.setPlaying(nextPlaying);
          links.setPlaying();
          break;
        case 'transition':
          nodes.setPlaying();
          links.setPlaying(nextPlaying);
          break;
      }
    }
  },

  // sync svg with node data
  updateNodes: function () {
    var svg = this.svg;
    var nodes = this.props.nodes.getNodes();
    debug("UPDATE NODES", nodes);

    //
    // JOIN new data to old nodes using id as the key
    //
    var node = svg.selectAll(".node")
      .data(nodes, function (d) { return d.id; });

    // 
    // ENTER new data as new nodes
    //
    var enter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("opacity", 1)
      // initial position
      .attr("transform", function(d) {
        // TODO: somehow move into Node defaults
        var x = this.props.width / 2.0;
        var y = 0;
        return "translate(" + x + "," + y + ")";
      }.bind(this))
      // TODO: are binds necessary here?
      .on("click", this.onNodeClick)
      .on("dblclick", this.onNodeDblClick);

    // animate flying in
    enter.transition(1000)
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    // add the circles
    enter.append("circle")
      .attr("r", 1.5)
      // TODO: can style inherit from properites of d?
      .style("fill", colorNode)
      // color and grow node on mouseover
      .on("mouseover", function (d) {
        var color = 1;
        d3.select(this).transition()
          .duration(300)
          .attr("r", 2)
          .style("fill", function (d) { return colorNode({ color: color }); });
      })
      .on("mouseout", function (d) {
        d3.select(this).transition()
          .duration(300)
          .attr("r", 1.5)
          .style("fill", colorNode);
      });

    // add the text 
    enter.append("text")
      .attr("x", 2)
      .attr("dy", ".25em")
      .text(function(d) { return d.track.get('title'); });

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
    node.exit().transition()
      .duration(500)
      .attr('opacity', 0)
      .remove();

  }, // /end updateNodes


  // sync displayed svg with link data
  updateLinks: function () {
    var svg = this.svg
    var nodes = this.props.nodes.getNodesMap();
    var links = this.props.links.getLinks()
    debug("UPDATE LINKS", links, nodes)

    //
    // JOIN new data to old links using id as the key
    //
    var path = svg.selectAll(".link")
      // TODO: fix d.track.cid, prob is softTransition w/out id
      .data(links, function (d) { return d.track.cid; });

    //
    // ENTER new data as new links
    //
    var enter = path.enter().append("svg:path")
      .attr("class", "link")
      // make soft transitions dashed
      .style("stroke-dasharray", function (d) {
        return ((d.transitionType !== 'soft') ? "" : ("1.5,1"));
      })
      // add link's arrow
      .attr("marker-end", "url(#end)")
      .style("stroke", colorLink)
      .attr("d", function (d) {
        return getPath({
          'd': d,
          'drawFrom': 'in',
          'nodes': nodes,
        });
      });

    // animate link entering
    enter.transition()
      .duration(1000)
      // TODO: make this work, also animate link growing
      .style('opacity', 1)
      .attr("d", function (d) {
        return getPath({
          'd': d,
          'nodes': nodes,
        });
      });

    // 
    // UPDATE existing links
    // 
    path.transition()
      .duration(1000)
      .style("stroke", colorLink)
      .attr("d", function (d) {
        return getPath({
          'd': d,
          'nodes': nodes,
        });
      });

    //
    // EXIT old links
    //
    path.exit().transition()
      .duration(500)
      .style('opacity', 0)
      .attr("d", function (d) {
        return getPath({
          'd': d,
          'drawFrom': 'null',
          'nodes': nodes,
        });
      })
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

function getPath (options) {
  var d = options.d;
  var nodes = options.nodes;

  // get inNode info        
  var inId = d.track.getInId();
  debug("inId", d.track.getInId());
  var inNode = nodes[inId];
  
  // get outNode info        
  var outId = d.track.getOutId();
  var outNode = nodes[outId];

  // figure out path
  var inX, inY, outX, outY;
  switch (options.drawFrom) {
    case 'in':
      inX = outX = inNode.x;
      inY = outY = inNode.y; break;
    case 'out':
      outX = inX = outNode.x;
      outY = inY = outNode.y; break;
    case 'null':
      outX = inX = 0;
      outY = inY = 0; break;
    default:
      inX = inNode.x;
      inY = inNode.y;
      outX = outNode.x;
      outY = outNode.y;
  }

  // get distances 
  var dx = outX - inX;
  var dy = outY - inY;
  var dr = Math.sqrt(dx * dx + dy * dy);
  var path = "M" +
    inX + "," +
    inY + "A" +
    dr + "," + dr + " 0 0,1 " +
    outX + "," +
    outY;
  debug("drawing path", d, inNode, outNode, nodes);

  return path;
}

// add the curvy lines
function tick(svg) {
  svg.selectAll(".link").attr("d", function(d) {

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

  svg.selectAll(".node").attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}