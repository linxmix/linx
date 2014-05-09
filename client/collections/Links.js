var Backbone = require('backbone');
var debug = require('debug')('collections:Links')

var Link = require('../models/Link');

module.exports = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.on("add", function(link) {
      debug("added link: " + link.id);
    });
    this.options = options;
    this.update();
  },

  setSVG: function (svg, width, height) {
    this.svg = svg;
    this.width = width;
    this.height = height;
    this.update();
  },

  setNodes: function (nodes) {
    this.nodes = nodes;
    this.update();
  },

  // TODO: make certain tracks are transitions
  merge: function (tracks) {
    // TODO: merge tracks into this
  },

  mergeQueue: function (tracks) {
    // merge, then update
    this.update();
  },

  mergeUpNext: function (tracks) {
    // merge, then update
    this.update();
  },

  // sync displayed svg with link data
  'update': function () {
    if (!(this.svg && this.nodes)) { return; }
    var links = _.pluck(this.models, 'attributes')
    debug("UPDATE LINKS", links, this.nodes)

    //
    // JOIN new data to old links using id as the key
    //
    var path = this.svg.selectAll(".link")
      // TODO: fix d.track.cid
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
          'nodes': this.nodes,
        });
      }.bind(this));

    // animate link entering
    enter.transition()
      .duration(1000)
      // TODO: make this work, also animate link growing
      .style('opacity', 1)
      .attr("d", function (d) {
        return getPath({
          'd': d,
          'nodes': this.nodes,
        });
      }.bind(this));

    // 
    // UPDATE existing links
    // 
    path.transition()
      .duration(1000)
      .style("stroke", colorLink)
      .attr("d", function (d) {
        return getPath({
          'd': d,
          'nodes': this.nodes,
        });
      }.bind(this));

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
          'nodes': this.nodes,
        });
      }.bind(this))
      .remove();

  }, // /end updateLinks

  model: Link,
});

//
// Utility Functions
//

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
  debug("drawing path", options, path);

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