Songs = new Meteor.Collection("Songs");
Transitions = new Meteor.Collection("Transitions");

//
// load web audio api
//

// TODO: move the relevant variables into the session thing (ie currSong and currTransition)
var context, currSong, offset = 0, lastMixTime = 0, BUFFERS = [], TIMERS = [], currTransition;

try {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  function makeBuffer (url, callback) {

    console.log("making buffer with url: "+url);

    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      // Asynchronously decode the audio file data in request.response
      context.decodeAudioData(
        request.response,
        function(buffer) {
          if (!buffer) {
            alert('error decoding file data: ' + url);
            return;
          }
          BUFFERS.push(buffer);
          if (callback) return callback(buffer);
          else return buffer;
        },
        function(error) {
          console.error('decodeAudioData error', error);
        }
        );
    };

    request.onerror = function() {
      alert('makeBuffer: XHR error');
    };

    request.send();
  }

  function makeSongBuffer(song, callback) {
    return makeBuffer('/songs/' + song.name + '.' + song.type, callback);
  }

  function makeTransitionBuffer(transition, callback) {
    return makeBuffer('/transitions/' +
      transition.startSong + '-' +
      transition.endSong + '.' + transition.type, callback);
  }

  function playSongBuffer(buffer, when, offset, duration) {
    when = when || 0;
    offset = offset || 0;
    duration = duration || buffer.duration - offset;

    // make source, make/set filters
    var source = context.createBufferSource();
    //var compressor = context.createDynamicsCompressor();
    var gain = context.createGain();
    source.buffer = buffer;
    // TODO: make gain a variable
    gain.gain.value = 0.52;

    // route source
    source.connect(gain);
    gain.connect(context.destination);
    //compressor.connect(context.destination);

    // start source, then return it
    source.start(when, offset, duration);
    return source;
  }

  function playBuffer(buffer, when, offset, duration) {
    when = when || 0;
    offset = offset || 0;
    duration = duration || buffer.duration - offset;

    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(when, offset, duration);
    return source;
  }


  function playTransition(transition, now) {
    lastMixTime = context.currentTime;
    if (now) {
      console.log("scheduling transition for NOW");
    } else if (!currSong) {
      console.log("ERROR: cannot play mix when there is no currSong");
      return;
    }

    // load songs and buffers
    currTransition = transition = (typeof transition == 'object') ?
    transition : chooseTransition(currSong, offset);

    if (!transition)
      return console.log("ERROR: found no transitions for current song");
    var endSong = Songs.findOne({ name: transition.endSong });

    // async
    makeTransitionBuffer(transition, function (transitionBuffer) {
      makeSongBuffer(endSong, function (endBuffer) {

        var lag = context.currentTime - lastMixTime;
        var songDuration = transition.startTime - offset - lag;
        songDuration = now ? 0 : songDuration; // play immediately if scheduled now
        var transitionDuration = songDuration + transitionBuffer.duration;

        console.log("transition in: "+songDuration);
        console.log("next song in: "+transitionDuration);
        console.log("buffer load lag: "+lag);

        // schedule the transition
        scheduleTransition(function() {
          // start the transition
          (currSong && currSong.source.stop(0));
          transition.source = playBuffer(transitionBuffer);
          currSong = transition;
        }, songDuration, function() {
          // start the next song and continue the mix
          endSong.source = playSongBuffer(endBuffer, 0, transition.endTime);
          setCurrentSong(endSong);
          offset = transition.endTime;
          playTransition();
        }, transitionDuration);

      });
    });
  }

  function unscheduleTransition() {
    // cancel pending transition
    for (var i = 0; i < TIMERS.length; i++) {
      clearTimeout(TIMERS[i]);
    }
  }

  function scheduleTransition(trans, transTime, next, nextTime) {
    unscheduleTransition(); // in case there's already one queued
    TIMERS[0] = setTimeout(trans, transTime * 1000.0);
    TIMERS[1] = setTimeout(next, nextTime * 1000.0);
  }

  function stopMix() {
    console.log("STOPPING EVERYTHING!");
    unscheduleTransition();
    (currSong && currSong.source.stop(0));
  }

  function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  }

  // algorithm to decide which transition comes next. will use Session for settings?
  function chooseTransition(startSong, offset, callback) {
    var choices = Transitions.find({
      startSong: startSong.name,
      // TODO: formalize this concept of "5" - it's the buffer load time ("lag")
      startTime: { $gt: offset + 5 }
    }, {
      sort: { playCount: 1 }
    }).fetch();

    for (var i = 0; i < choices.length; i++) {
      console.log("found transition to: " + choices[i].endSong);
    }
    var choice = choices[0];

    console.log("CHOOSING transition: " + choice.endSong);

    if (callback) { return callback(choice); }
    else return choice;
  }

  function startMix(startSong, transition, startPos) {
    startPos = startPos || 60;
    startSong = startSong || Songs.findOne({ name: "dont you worry child" });

    console.log(startSong);
    makeSongBuffer(startSong, function (startBuffer) {
      startSong.source = playSongBuffer(startBuffer, 0, startPos);
      setCurrentSong(startSong);
      playTransition(transition);
    });
  }

  function setCurrentSong(song) {
    Songs.update(song._id, { $inc: { playCount: 1 } });
    currSong = song;
  }

/*
makeBuffer("/songs/alive.mp3", function() {
    makeBuffer("/transitions/alive-torrent.wav", function() {
      makeBuffer("/songs/torrent.mp3", function() {
        var start = BUFFERS[0];
        var transition = BUFFERS[1];
        var end = BUFFERS[2];

        var latency = 0;
        var val = 0.743209;
        var advance = 225;
        var songDuration = 250.603012 + latency - advance;
        var transitionDuration = songDuration + transition.duration;

        console.log("songDuration: "+songDuration);
        console.log("transitionDuration"+transitionDuration);

        playSongBuffer(start, 0, advance, songDuration);
        playBuffer(transition, songDuration);
        playSongBuffer(end, transitionDuration, 62.447994);
      });
    });
  });
*/
}
catch(e) {
  console.log('Web Audio API is not supported in this browser');
}

//
// do meteor stuff
//
Template.player.events({

  'click #start': function() {
    stopMix();
    var song, transition = Transitions.findOne(Session.get("selected_transition"));
    if (transition) song = Songs.findOne({ name: transition.startSong });
    startMix(song, transition);
  },

  'click #transitionNow': function() {
    playTransition(currTransition, true);
  },

  'click #stop': stopMix,

  // TODO: make it so you can only do this (and transition now) during a song, not during a transition!
  // ^ implemented by checking currSong to see if it's a transition
  // TODO: make it so this changes to the already scheduled song (rather than reselecting)
  'click #selectTransition': function() {
    unscheduleTransition();
    offset += (context.currentTime - lastMixTime);
    playTransition(Transitions.findOne(Session.get("selected_transition")));
  }
});

Template.transition.events({
  'click': function() {
    Session.set("selected_transition", this._id);
  }
});

// TODO: sliders for volume and offset. maybe a skip 30sec (or to next transition) button?

Template.songs.songs = function () {
  return Songs.find();
};

Template.transitions.transitions = function () {
  return Transitions.find({
      startSong: (currSong ? currSong.name : "dont you worry child"),
      // TODO: formalize this concept of "5" - it's the buffer load time ("lag")
      startTime: { $gt: offset + 5 }
    }, {
      sort: { playCount: 1 }
    });
};

Template.transition.selected = function () {
  return Session.equals("selected_transition", this._id) ? "selected" : "";
};

// d3 stuff
Template.graph.destroyed = function () {
  console.log("GRAPH DESTROYED! this.drawGraph: "+this.drawGraph);
  this.drawGraph.stop();
};

Template.graph.rendered = function () {
  this.drawGraph = Meteor.autorun(function () {

    var links = Transitions.find().fetch(), nodes = {};

    // compute distinct nodes from links
    links.forEach(function (link) {
      link.source = nodes[link.startSong] || (nodes[link.startSong] = { name: link.startSong });
      link.target = nodes[link.endSong] || (nodes[link.endSong] = { name: link.endSong });
    });

    var width = 960,
    height = 500;

    var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(100)
    .charge(-400)
    .on("tick", tick)
    .start();

    // destroy old stuff
    var graphWrapper = d3.select("#graph-wrapper").text("");

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
    .attr("marker-end", "url(#end)");

    // define the nodes
    var node = svg.selectAll(".node")
    .data(force.nodes())
    .enter().append("g")
    .attr("class", "node")
    .call(force.drag);

    // add the nodes
    node.append("circle")
    .attr("r", 7.5);

    // add the text 
    node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });

    // add the curvy lines
    function tick() {
      path.attr("d", function(d) {
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

      node
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"; });
    }
  });
};