//
// global Graph object
//

// TODO: make it so links are drawn naturally instead of in tick
// TODO: fix linx map view, broken because using "x" instead of "px"?
// TODO: update positions when song changes

Graph = {

  // forces redraw of the graph
  'forceRedraw': function () {
    Session.set("lastGraphUpdate", new Date());
  },

  // queue song as an upNext node in the graph
  'queue': function(node) {
    // TODO
  },

  // determine which songs and transitions are upNext
  'computeUpNext': function() {
    var queuedSongs = Graph['queuedSongs'];
    var lastSong = queuedSongs[queuedSongs.length - 1]
    var queuedSongIds = queuedSongs.map(function (song) {
      return song._id;
    });
    // find all transitions out of lastSong
    var startTime = (lastSong._id === Graph['currSong']._id) ?
        Mixer.getCurrentPosition() : lastSong.startTime;
    Graph['transitionsUpNext'] = Transitions.find({
      'startSong': lastSong._id,
      'startSongEnd': { $gt: startTime },
      // exclude songs already in the queue
      'endSong': { $nin: queuedSongIds }
    }).fetch();
    // add endSong of each transition to upNext
    Graph['upNext'] =
      Graph['transitionsUpNext'].map(function (transition) {
        var song = Songs.findOne(transition.endSong);
        song['transition'] = transition;
        return song;
    });
  },

  // place upNext songs in a circle around lastSong
  'updateUpNextPositions': function() {
    var upNext = Graph['upNext'];
    for (var i = 0; i < upNext.length; i++) {
      var song = upNext[i];
      var theta = (i / upNext.length) * (2.0 * Math.PI);
      song['x'] = Graph['x0'] + Graph['r'] * Math.cos(theta);
      song['y'] = Graph['y0'] + Graph['r'] * Math.sin(theta);
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

  // draw a fresh version of the Graph
  'update': function() {
    console.log("updateing graph");

    // determine Graph's song and transition queue data
    Graph['queuedTransitions'] = Mixer.getQueue('transition');
    Graph['queuedSongs'] = Mixer.getQueue('song');
    Graph['currSong'] = Graph['queuedSongs'][0];

    // if we have a currSong, draw graph in view mix mode
    if (Graph['currSong']) {

      // position queued songs
      Graph.updateQueuePositions();

      // compute and position upNext songs
      Graph.computeUpNext();
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

    // no currSong, so draw graph in view all mode
    else {
      var queuedTransitions = Graph['queuedTransitions'];
      var currTransition = queuedTransitions[0];
      var dj = Session.get("graph_filter_query");
      var options = dj ? { 'dj': dj } : {};
      var links = Graph['links'] =
        Transitions.find(options).fetch();
      var nodes = Graph['nodes'];

      // compute distinct nodes from links
      links.forEach(function (link) {
        link.source = nodes[link.startSong] ||
          (nodes[link.startSong] = Songs.findOne(link.startSong));
        link.target = nodes[link.endSong] ||
          (nodes[link.endSong] = Songs.findOne(link.endSong));

        // color links
        if (link._id == (currTransition && currTransition._id)) {
          link.color = 2;
        } else {
          queuedTransitions.forEach(function (transition) {
            if (link._id == transition._id) {
              link.color = 1;
            }
          });
        }
      });

      // use force graph
      var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([Graph.width, Graph.height])
        .gravity(0.05)
        .linkDistance(100)
        .charge(-350)
        //.on("tick", tick)
        .start();

      // redraw links and nodes
      Graph.updateNodes(force.nodes());
      Graph.updateLinks(force.links());

    } // end view all mode

  }, // end update

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

  },

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

  },


  // animate addition of given node to graph
  'arrive': function(node) {
    // todo
  },

  // animate removal of given node from graph 
  'depart': function(node) {
    // todo
  },

  //
  // Graph Vars
  //
  'currSong': {},
  'queuedSongs': [],
  'queuedTransitions': [],
  'upNext': [],
  'transitionsUpNext': [],
  'nodes': [],
  'links': [],
  // set graph width and height to be that of client's screen
  'width': $(window).width() - 50,
  'height': $(window).height() - 96,
  'svg': {},
}
Graph['x0'] = Graph.width / 2.0;
Graph['y0'] = Graph.height / 2.0;
Graph['r'] = Graph.height / 2.5;

//
// d3 stuff
//

Template.graph.destroyed = function () {
  console.log("GRAPH DESTROYED!");
};

Template.graph.lastUpdate = function () {
  return Session.get('lastGraphUpdate');
}

Template.graph.rendered = function () {

  // set graph width and height to be that of client's screen
  $('#graph').width($(window).width() - 50);
  $('#graph').height($(window).height() - 96);
  // create svg
  Graph.svg = d3.select("#graph").append("svg")
    .attr("width", Graph.width)
    .attr("height", Graph.height);

  // build the arrow.
  Graph.svg.append("svg:defs").selectAll("marker")
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
  Graph.update();
};

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