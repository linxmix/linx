//
// d3 stuff
//
Template.graph.destroyed = function () {
  console.log("GRAPH DESTROYED! this.drawGraph: "+this.drawGraph);
  this.drawGraph.stop();
};

Template.graph.rendered = function () {
  this.drawGraph = Meteor.autorun(function () {

    var nodes = {},
        links = [],
        width = 640,
        height = 480;
    
    var currSong = Songs.findOne(Session.get("current_song"));
    if (!currSong) { return console.log("NOT DRAWING GRAPH"); }

    // define current song as center node
    currSong["fixed"] = true;
    currSong["px"] = width/2;
    currSong["py"] = height/2;
    currSong["color"] = 2;
    nodes[currSong.name] = currSong;
    // get all nodes adjacent to currSong
    links = Transitions.find( { startSong: currSong.name }).fetch()
    .map(function (transition) {
      if (transition._id === Session.get("current_transition")) {
        transition.color = 2;
      }
      return transition;
    });

    // color queued transitions
    console.log("queued transitions:");
    var queuedTransitions = Session.get("queued_transitions");
    console.log(queuedTransitions);
    for (var i = 0; i < queuedTransitions.length; i++) {
      var transition = queuedTransitions[i];
          endSong = Songs.findOne({ name: transition.endSong });
      endSong["color"] = 1;
      nodes[endSong.name] = endSong;
      // get all nodes adjacent to endSong
      links = links.concat(Transitions.find( { startSong: endSong.name }).fetch());
    }

    // compute distinct nodes from links
    links.forEach(function (link) {
      link.source = nodes[link.startSong] || (nodes[link.startSong] = { name: link.startSong, color: 0 });
      link.target = nodes[link.endSong] || (nodes[link.endSong] = { name: link.endSong, color: 0 });
      link.color = link.color || 0;
    });

    // compute appropriate link for each node
    for (var nodeName in nodes) {
      var song = nodes[nodeName];
      song.transition_info = getNearestValidTransition(song);
    }

    var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .gravity(0.01)
    .linkDistance(100)
    .charge(-350)
    .on("tick", tick)
    .start();

    // destroy old stuff
    var graphWrapper = d3.select("#graph-wrapper").text("");

    // init new stuff
    var svg = graphWrapper.append("svg")
    .attr("width", width)
    .attr("height", height);

    // build the arrow.
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

    // add the links and the arrows
    var path = svg.append("svg:g").selectAll("path")
    .data(force.links())
    .enter().append("svg:path")
    .attr("class", "link")
    .attr("marker-end", "url(#end)")
    .attr("id", function(d) { return d._id; })
    .style("stroke", colorLink);

    // define the nodes
    var node = svg.selectAll(".node")
    .data(force.nodes())
    .enter().append("g")
    .attr("class", "node")
    .attr("id", function(d) { return d._id; })
    .call(force.drag);

    // add nodes's circles
    node.append("circle")
    .attr("r", 10)
    .style("fill", colorNode)
    .on("dblclick", function (d) {
      // TODO: this should make sure this node is not queued at all
      if (d._id !== currSong._id) {
        queueTransition(d.transition_info['transition'], d.transition_info['index']);
      }
    })
    .on("mouseover", function(d) {
      var color = (d._id !== currSong._id) ? 1 : 2;
      d3.select(this).transition()
      .duration(300)
      .attr("r", 15)
      .style("fill", function(d) { return colorNode({ color: color }); });
    })
    .on("mouseout", function(d) {
      d3.select(this).transition()
      .duration(300)
      .attr("r", 10)
      .style("fill", colorNode);
    });

    // add the text 
    node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });

    function colorNode(d) {
      var colors = ["#ff0000", "#00ff00", "#0000ff"]; // red, green, blue
      return colors[d.color];
    }

    function colorLink(d) {
      var colors = ["#c62728", "#2ca02c", "#1f77b4"]; // red, green, blue
      return colors[d.color];
    }

    // add the curvy lines
    function tick() {
      path.attr("d", function(d) {

        /*// recenter path's circle
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

      node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
  });
};

//
// graph algorithms
//

/*
 * dijkstra.js
 *
 * Dijkstra's single source shortest path algorithm in JavaScript.
 *
 * Cameron McCormack <cam (at) mcc.id.au>
 *
 * Permission is hereby granted to use, copy, modify and distribute this
 * code for any purpose, without fee.
 *
 * Initial version: October 21, 2004
 */

 function shortestPath(edges, numVertices, startVertex) {
  var done = new Array(numVertices);
  done[startVertex] = true;
  var pathLengths = new Array(numVertices);
  var predecessors = new Array(numVertices);
  for (var i = 0; i < numVertices; i++) {
    pathLengths[i] = edges[startVertex][i];
    if (edges[startVertex][i] != Infinity) {
      predecessors[i] = startVertex;
  }
}
pathLengths[startVertex] = 0;
for (var i = 0; i < numVertices - 1; i++) {
    var closest = -1;
    var closestDistance = Infinity;
    for (var j = 0; j < numVertices; j++) {
      if (!done[j] && pathLengths[j] < closestDistance) {
        closestDistance = pathLengths[j];
        closest = j;
    }
}
done[closest] = true;
for (var j = 0; j < numVertices; j++) {
  if (!done[j]) {
    var possiblyCloserDistance = pathLengths[closest] + edges[closest][j];
    if (possiblyCloserDistance < pathLengths[j]) {
      pathLengths[j] = possiblyCloserDistance;
      predecessors[j] = closest;
  }
}
}
}
return { "startVertex": startVertex,
"pathLengths": pathLengths,
"predecessors": predecessors };
}

function constructPath(shortestPathInfo, endVertex) {
  var path = [];
  while (endVertex != shortestPathInfo.startVertex) {
    path.unshift(endVertex);
    endVertex = shortestPathInfo.predecessors[endVertex];
}
return path;
}