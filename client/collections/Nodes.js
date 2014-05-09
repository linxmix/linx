var Backbone = require('backbone');
var debug = require('debug')('collections:Nodes')

var Node = require('../models/Node');

module.exports = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.on("add", function(node) {
      debug("added node: " + node.id);
    });
    this.options = options;
    this.update();
  },

  setSVG: function (svg, width, height) {
    this.svg = svg;
    this.width = width;
    this.height = height;
    this.x0 = width / 2.0,
    this.y0 = height / 2.0,
    this.r = height / 2.5,
    this.update();
  },

  // TODO: make certain tracks are songs
  merge: function (tracks) {
    // TODO: merge tracks into this
  },

  mergeQueue: function (tracks) {
    // merge, then update queue, then update
  },

  mergeUpNext: function (tracks) {
    // merge, then update upNext, then update
  },

  // TODO: do this!
  // place upNext songs in a circle around lastSong
  'updateUpNext': function () {
    var nodes = this.props.upNext['nodes'];
    debug("updating upNext", nodes);
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

  // TODO: do this!
  // place and color queued songs
  updateQueue: function () {
    var nodes = this.props.queue['nodes'];
    debug("updating queue", nodes);
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

  // sync svg with node data
  'update': function () {
    if (!this.svg) { return; }
    var nodes = _.pluck(this.models, 'attributes')
    debug("UPDATE NODES", nodes);

    //
    // JOIN new data to old nodes using id as the key
    //
    var node = this.svg.selectAll(".node")
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
        var x = this.props.width / 2;
        var y = 0;
        return "translate(" + x + "," + y + ")";
      }.bind(this))
      // set node active on click
      .on("click", function (d, i) {
        debug("click", d, i);
      // TODO: why does this force mixbuilder to rerender twice?
        this.props.setActiveTrack(d.track);
      }.bind(this))
      // play node on double click
      .on("dblclick", function (d, i) {
        debug("dblclick", d);
        this.props.playViewing(i, {
          'track': d.track,
        });
      }.bind(this))

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

  model: Node,
});

//
// Utility Functions
//

function colorNode(d) {
  var colors = ["#ff0000", "#00ff00", "#0000ff"], // red, green, blue
      color = (d && d.color) || 0;
  return colors[color];
}