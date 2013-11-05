//
// d3 stuff
//

Template.graph.destroyed = function () {
  console.log("GRAPH DESTROYED! this.drawGraph: "+this.drawGraph);
  this.drawGraph.stop();
};

Template.graph.rendered = function () {
  var width = $("#graph").width(),
      height = $("#graph").height();

  // enable overscroll
  $('.graph-wrapper').overscroll({
      'hoverThumbs': true,
      'scrollLeft': width / 2 - $(window).width() / 2,
      'scrollTop': height / 2 - ($(window).height() - 51) / 2,
    });

  // redraw graph whenever receiving new information
  this.drawGraph = Meteor.autorun(function () {

    var nodes = {},
        links = [],
        charge = $('#chargeSlider').slider('getValue');

    //console.log("CHARGE: "+charge);
    //console.log("width: "+$("#graph").width());
    //console.log("height: "+$("#graph").height());

    //
    // preprocess nodes and links
    //
    var queuedTransitions = Mixer.getQueue('transition');
    var currTransition = queuedTransitions[0];
    var queuedSongs = Mixer.getQueue('song');
    var currSong = queuedSongs[0];

    // if we have a currSong, draw graph in view mix mode
    if (currSong) {

      // define current song as center node
      currSong["fixed"] = true;
      currSong["px"] = width / 2;
      currSong["py"] = height / 2;
      currSong["color"] = 2;
      nodes[currSong._id] = currSong;

      // process nodes of queued transitions
      queuedTransitions.forEach(function (transition) {
        if (transition) {
          var endSong = Songs.findOne(transition.endSong);
          endSong["color"] = 1;
          nodes[endSong._id] = endSong;
        }
      });

      // get all links in queue + all possible links coming from last song in queue
      var lastSong = queuedSongs[queuedSongs.length - 1];
      var startTime = (lastSong._id === currSong._id) ?
        Mixer.getCurrentPosition() : lastSong.startTime;
      links = queuedTransitions.concat(Transitions.find({
        'startSong': lastSong._id,
        'startSongEnd': { $gt: startTime }
      }).fetch());

    // no currSong, so draw graph in view all mode
    } else {
      var dj = Session.get("graph_filter_query");
      var options = dj ? { 'dj': dj } : {};
      links = Transitions.find(options).fetch();
    }

    // compute distinct nodes from links
    links.forEach(function (link) {
      link.source = nodes[link.startSong] || (nodes[link.startSong] = Songs.findOne(link.startSong));
      link.target = nodes[link.endSong] || (nodes[link.endSong] = Songs.findOne(link.endSong));

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

    // compute appropriate link for each node
    if (currSong) {
      for (var node_id in nodes) {
        var node = nodes[node_id];
        node.transition_info = Mixer.getNearestValidTransition(node);
      }
    }
    //
    // end preprocess
    //

    var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .gravity(0.05)
    .linkDistance(100)
    .charge(-350)
    .on("tick", tick)
    .start();

    // destroy old stuff
    var graphWrapper = d3.select("#graph").text("");

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
    // make soft transitions dashed
    .style("stroke-dasharray", function (d) {
      return ((d.transitionType !== 'soft') ? "" : ("3,3"));
    })
    .attr("marker-end", "url(#end)")
    // TODO: will the following be a problem for soft transitions w/ dupe ids?
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
      if (d.transition_info) {
        Mixer.queue({
          'sample': d.transition_info['transition'],
          'index': d.transition_info['index'],
        });
      } else if (!currSong) {
        Mixer.play(d);
      }
    })
    .on("mouseover", function (d) {
      var color = (currSong && (d._id == currSong._id)) ? 2 : 1;
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
    node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });

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
      path.attr("d", function(d) {

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

      node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
  });
};