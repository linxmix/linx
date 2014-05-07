/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/Graph')

var _ = require('underscore');
var $ = jQuery = require('jquery');
var d3 = require('d3');
require('jquery-overscroll');

var Track = require('../../models/Track');
var Node = require('../../models/Node');

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
    };
  },

  render: function () {
    return (<svg id="graph">
    </svg>);
  },  
      //<rect x="0" y="0" width="100" height="100" fill="yellow" stroke="black" stroke-width="12"/>

  componentDidMount: function () {

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
      .attr("markerWidth", 2.5)
      .attr("markerHeight", 2.5)
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

    //
    // see if things changed
    //

    // queue
    var prevQueue = prevProps.queue;
    var queue = this.props.queue;
    var queueNodes = (prevQueue.nodes !== queue.nodes);
    var queueLinks = (prevQueue.links !== queue.links);

    // upNext
    var prevUpNext = prevProps.upNext;
    var upNext = this.props.upNext;
    var upNextNodes = (prevUpNext.nodes !== upNext.nodes);
    var upNextLinks = (prevUpNext.links !== upNext.links);

    // playing
    var prevPlaying = prevProps.playing;
    var playing = this.props.playing;
    var prevPlayingId = prevPlaying && prevPlaying.id;
    var playingId = playing && playing.id;
    var playingChanged = !playingId || (prevPlayingId !== playingId);

    // active
    var prevActive = prevProps.active;
    var active = this.props.active;
    var prevActiveId = prevActive && prevActive.id;
    var activeId = active && active.id;
    var activeChanged = !activeId || (prevActiveId !== activeId);
    debug("GRAPH UPDATE", queueNodes, queueLinks,
      upNextNodes, upNextLinks, playingChanged, activeChanged);

    //
    // update based on changes
    //

    // update if upNext changed
    if (upNextNodes || upNextLinks) {
      this.updateUpNext();
    }
    // update if queue changed
    if (queueNodes || queueLinks) {
      this.updateQueue();
    }

    // update if playing changed
    if (playingChanged) {
      this.updatePlaying(prevPlaying);
    }
    // update if active changed
    if (activeChanged) {
      this.updateActive(prevActive);
    }

    // update if nodes changed
    if (upNextNodes || queueNodes ||
      activeChanged || playingChanged) {
      var options = {};
      debug("ABOUT TO UPDAT ENODES", active)
      if (active &&
        (active.get('linxType') === 'song')) {
        options['active'] = active;
      }
      if (playing &&
        (playing.get('linxType') === 'song')) {
        options['playing'] = playing;
      }
      this.updateNodes(options);
    }

    // update if links changed
    if (upNextLinks || queueLinks ||
      activeChanged || playingChanged) {
      var options = {};
      if (active &&
        (active.get('linxType') === 'transition')) {
        options['active'] = active;
      }
      if (playing &&
        (playing.get('linxType') === 'transition')) {
        options['playing'] = playing;
      }
      this.updateLinks(options);
    }

  },

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

  // place and color queued songs
  'updateQueue': function () {
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

  // sync displayed svg with node data
  'updateNodes': function (options) {
    options = options ? options : {};
    // TODO: just use models?
    var queueNodes = _.pluck(this.props.queue.nodes.models, 'attributes');
    var upNextNodes = _.pluck(this.props.upNext.nodes.models, 'attributes');
    var nodes = queueNodes.concat(upNextNodes);

    // update this.nodes
    this.nodes = {};
    nodes.forEach(function (node) {
      this.nodes[node.id] = node;
    }.bind(this));

    // possibly add [active/playing]
    var active = options.active;
    if (active && !(this.nodes[active.id])) {
      this.updateActive();
      this.nodes[active.id] = active.attributes;
      nodes.push(active.attributes);
    }
    var playing = options.playing;
    if (playing && !(this.nodes[playing.id])) {
      this.updatePlaying();
      this.nodes[playing.id] = playing.attributes;
      nodes.push(playing.attributes);
    }

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

  // sync displayed svg with link data
  'updateLinks': function () {
    var queueLinks = _.pluck(this.props.queue.links.models, 'attributes');
    var upNextLinks = _.pluck(this.props.upNext.links.models, 'attributes');
    var links = queueLinks.concat(upNextLinks);
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