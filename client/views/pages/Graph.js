/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/MixBuilder')

var _ = require('underscore');
var $ = require('jquery');
var d3 = require('d3');

// TODO: make it so links are drawn naturally instead of in tick
// TODO: fix linx map view, broken because using "x" instead of "px"?
// TODO: update positions when song changes

module.exports = React.createClass({
  mixins: [ReactBackboneMixin],

  render: function () {
    return (<div id="graph"></div>);
  },

  componentDidUpdate: function (prevProps, prevState) {
    // TODO: refine this
    this.update(prevProps, prevState);
  },

  componentDidMount: function () {

  // set graph width and height
  var height = this.props.height;
  var width = this.props.width;
  this.$('#graph').width(width);
  this.$('#graph').height(height);
  // create svg
  var svg = this.svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height);

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

  // draw graph
  this.update();

  },

  // update graph based on changes
  // TODO: determine changes, then only do those
  'update': function (prevProps, prevState) {
    console.log("updateing graph");


    // if we have a currSong, draw graph in view mix mode
    if (Graph['currSong']) {

      // position queued songs
      Graph.updateQueuePositions();

      // position upNext songs
      Graph.updateUpNextPositions();

      // update links and nodes
      Graph['links'] = Graph['queuedTransitions'].concat(
        Graph['transitionsUpNext']);
      Graph['nodes'] = Graph['queuedSongs'].concat(
        Graph['upNext']);

      // redraw links and nodes
      Graph.updateNodes();
      Graph.updateLinks();

    } // end view mix mode

    // no currSong, so draw graph in intro mode
    else {
      // TODO
    }

  }, // end update

  // place upNext songs in a circle around lastSong
  'updateUpNextPositions': function() {
    var upNext = this.state.upNext;
    var x0 = this.state.x0;
    var y0 = this.state.y0;
    var r = this.state.r;
    for (var i = 0; i < upNext.length; i++) {
      var song = upNext[i];
      var theta = (i / upNext.length) * (2.0 * Math.PI);
      song['x'] = x0 + r * Math.cos(theta);
      song['y'] = y0 + r * Math.sin(theta);
    }
  },

  // place and color queued songs
  'updateQueuePositions': function() {
    var queuedSongs = Graph['queuedSongs'];
    for (var i = 0; i < queuedSongs.length; i++) {
      var song = queuedSongs[i];
      song['x'] = 30 * i + 30;
      song['y'] = Graph.height - 30;
      song['color'] = (i == 0) ? 2 : 1;
    }

    // place lastSong in center of screen
    var lastSong = queuedSongs[queuedSongs.length - 1];
    if (lastSong) {
      lastSong['x'] = Graph['x0'];
      lastSong['y'] = Graph['y0'];
    }
  },


  // sync displayed svg with node data
  'updateNodes': function(nodes) {
    if (typeof nodes === 'undefined') { nodes = Graph.nodes; }

    //
    // JOIN new data to old nodes using _id as the key
    //
    var node = Graph.svg.selectAll(".node")
      // TODO: does this update existing nodes with new data?
      .data(nodes, function (d) { return d._id; });

    // 
    // ENTER new data as new nodes
    //
    var enter = node.enter().append("svg:g")
      .attr("class", "node")
      // initial position
      .attr("transform", function(d) {
        var x = Graph.width / 2;
        var y = 0;
        return "translate(" + x + "," + y + ")";
      })
      // play or queue node on double click
      .on("dblclick", function (d) {
        if (d.transition) {
          Mixer.queue({
            'sample': d.transition,
            'index': d.transition['index'],
          });
          // update graph
          Graph.update();
        } else if (!Graph['currSong']) {
          Mixer.play(d);
          // force graph redraw
          Graph.forceRedraw();
        }
      });

    // animate flying in
    enter.transition(1000)
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    // add the circles
    enter.append("circle")
      .attr("r", 10)
      .style("fill", colorNode)
      // color and grow node on mouseover
      .on("mouseover", function (d) {
        var color = (Graph['currSong'] && (d._id == Graph['currSong']._id)) ? 2 : 1;
        d3.select(this).transition()
          .duration(300)
          .attr("r", 15)
          .style("fill", function (d) { return colorNode({ color: color }); });
      })
      .on("mouseout", function (d) {
        d3.select(this).transition()
          .duration(300)
          .attr("r", 10)
          .style("fill", colorNode);
      });

    // add the text 
    enter.append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

    // 
    // UPDATE existing nodes
    // 
    node.transition()
      .duration(1000)
      .attr("transform", function(d) {
        console.log("updating node: ", d);
        return "translate(" + d.x + "," + d.y + ")";
      })
      .select("circle")
      // recolor node's circle
      .style("fill", function (d) { return colorNode(d); });

    //
    // EXIT old nodes
    //
    node.exit()
      .remove();

  }, // /end updateNodes

  // sync displayed svg with link data
  'updateLinks': function(links) {
    if (typeof links === 'undefined') { links = Graph.links; }

    //
    // JOIN new data to old links using _id as the key
    //
    console.log("links", links)
    var path = Graph.svg.selectAll(".link")
      .data(links, function (d) { return d._id; });

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

  Graph.svg.selectAll(".node").attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}