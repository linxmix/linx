currWave = null;

//
// exported functions
//
startMix = function(startSong, startPos) {
  if (Meteor.userId() != Meteor.users.findOne({ username: 'test' })._id) {
    return alert("Sorry, but you cannot stream music unless you're logged into an account that owns it. If you'd like to help test this app, contact wolfbiter@gmail.com.");
  }
  startPos = startPos || 0;
  if (!startSong) {
    return console.log("ERROR: select a song in order to start the mix");
  }
  Session.set("current_transition", startSong._id);
  scheduleSong(startSong._id, startSong, 0, startPos);
};

stopMix = function() {
  console.log("STOPPING EVERYTHING!");
  clearTimers();
  Session.set("queued_transitions", []);
  Session.set("current_transition", undefined);
  Session.set("current_song", undefined);
  stopCurrSource();
};

transitionNow = function() {
  doNextTransition(true);
};

queueTransition = function(transition, index) {
  var queuedTransitions = Session.get("queued_transitions");
  if (index === undefined) index = queuedTransitions.length;
  var prevTransition = queuedTransitions[index - 1];

  console.log("queueTransition called with below at index: "+index);
  console.log(transition);

  // make sure this transition fits at this index
  if (!isValidTransition(prevTransition, transition, true)) {
    return console.log("ERROR: Invalid Transition given to queueTransition");
  }

  // TODO: is this check necessary?
  /*
  if (queuedTransitions.indexOf(transition._id) > -1) {
    console.log("WARNING: given transition to "+transition.endSong+" is already queued");
  }
  */

  // if this transition is "soft", fill in its startSong
  if (!transition._id) {
    console.log("queueing soft transition");
    transition.startSong =
      (prevTransition && prevTransition.endSong) ||
      Session.get("current_song");
  }

  // update queuedTransitions with this transition
  queuedTransitions.splice(index, queuedTransitions.length - index, transition);
  Session.set("queued_transitions", queuedTransitions);

  // if index is 0, we are replacing the current transition
  if (index === 0) {
    doNextTransition();
  }
};

doNextTransition = function (now) {
  var offset = getOffset();
  // figure out which transition to schedule, set that as current
  var queuedTransitions = Session.get("queued_transitions");
  var transition = queuedTransitions[0] || chooseTransition(offset),
      endSong, when;

  if (!transition) {
    return console.log("ERROR: found no transitions for current song");

  // if there's no ID, this is a "soft" transition
  } else if (!transition._id) {
    endSong = Songs.findOne(transition.endSong);
    console.log("SOFT transition");
    // set current transition to this song's ID to signify a "soft" transition
    Session.set("current_transition", endSong._id);
    when = (now || !currSource) ? 0 : (currSource.buffer.duration - offset);
    scheduleSong(endSong._id, endSong, when, 0);

  // this is a regular transition
  } else {
    endSong = Songs.findOne(transition.endSong);
    Session.set("current_transition", transition._id);
    // TODO: make these faster by being completely asynchronous,
    //       knowing transition duration ahead of time and handling lag appropriately
    // load transition buffer
    when = now ? 0 : (transition.startTime - offset);
    scheduleTransition(transition, endSong, when, function (transitionEnd) {
      scheduleSong(transition._id, endSong, transitionEnd, transition.endTime);
    });
  }
};

// returns a valid transition to song such that queued_transitions
// retains maximum possible length. 
// TODO: what if none exist? add a soft transition to the end? or maybe find a path such that one exists?
getNearestValidTransition = function(song) {
  var queuedTransitions = Session.get("queued_transitions"),
      transitions = Transitions.find({ endSong: song._id }).fetch();
  for (index = queuedTransitions.length - 1; index >= -1; index--) {
    for (var i = 0; i < transitions.length; i++) {
      var transition = transitions[i];
      if (isValidTransition(queuedTransitions[index], transition)) {
        return { 'transition': transition, 'index': ++index };
      }
    }
  }
  return console.log("ERROR: found no valid transitions for: "+song.name);
};
//
// /exported functions
//


//
// private methods
//
function scheduleSong(_id, endSong, when, offset) {
  when = when || 0;
  offset = offset || 0;
  var currTime = context.currentTime;
  var songPath = getSongPath(endSong);
  makeBuffer(songPath, function (endBuffer) {

    // calculate lag
    var lag = context.currentTime - currTime;
    when -= lag;
    updateBufferLoadSpeed(songPath, lag);

    // validation
    if (when < 0) {
      console.log("WARNING: scheduled song: "+endSong.name+" started late by: "+when);
      when = 0;
    }
    if (_id != Session.get("current_transition")) {
      return console.log("WARNING: Transition changed while loading song buffer.");
    }
    console.log("next song in: "+when);

    // start the next song and continue the mix
    TIMERS.push(setTimeout(function() {
      endSong.source = playSongBuffer(endBuffer, 0, offset);
      setCurrentSong(endSong);
      setOffset(offset);
      queuedTransitions = Session.get("queued_transitions");
      queuedTransitions.shift();
      Session.set("queued_transitions", queuedTransitions);
      doNextTransition();
    }, when * 1000.0));
  });
}

function scheduleTransition(transition, endSong, when, callback) {
  when = when || 0;
  clearTimers(); // in case any others were already scheduled
  var currTime = context.currentTime;
  var transitionPath = getTransitionPath(transition);
  makeBuffer(transitionPath, function (transitionBuffer) {

    // calculate load lag
    var lag = context.currentTime - currTime;
    when -= lag;
    //updateBufferLoadSpeed(transitionPath, lag);

    // validation
    if (when <= 0) {
      console.log(
        "WARNING: scheduled transition w endSong: "+endSong.name+" started late by: "+when);
      when = 0;
    }
    if (transition._id !== Session.get("current_transition")) {
      return console.log(
        "WARNING: Transition changed while loading transition buffer.");
    }
    console.log("transition in: "+when);

    // schedule the transition
    TIMERS.push(setTimeout(function() {
      // start the transition
      stopCurrSource();
      transition.source = playBuffer(transitionBuffer);
      Transitions.update(transition._id, { $inc: { playCount: 1 } });
    }, when * 1000.0));

    callback(when + transitionBuffer.duration);
  });
}

function clearTimers() {
  TIMERS.forEach(clearTimeout);
  TIMERS = [];
}

function shuffle(o){
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

// algorithm to decide which transition comes next.
function chooseTransition(offset) {
  var currSong_id = Session.get("current_song");
  var choices = Transitions.find({
    startSong: currSong_id,
    startTime: { $gt: offset + Session.get("load_time") }
  }).fetch();

  // find choice with endSong that has least number of plays amongst choices
  var transition = choices[0],
      endSong = (transition && Songs.findOne(transition.endSong)) ||
        Songs.findOne();
  // TODO: make this a slick database query
  for (var i = 0; i < choices.length; i++) {
    var _transition = choices[i];
    var _endSong = Songs.findOne(_transition.endSong);
    if (_endSong.playCount < endSong.playCount) {
      transition = _transition;
      endSong = _endSong;
    }
  }

  // if there is a song with a lower playCount than endSong, soft transition to it
  var song = Songs.findOne({ playCount: { $lt: endSong.playCount } });
  if (song) {
    transition = {
      startSong: currSong_id,
      endSong: song._id,
      startTime: 0,
      endTime: 0
    };
  }

  console.log("CHOOSING transition: ");
  console.log(transition);

  // TODO: should this be here? shouldnt we be calling queueTransition?
  Session.set("queued_transitions", [transition]);

  return transition;
}

function getOffset() {
  var offset = Session.get("offset");
  return offset.value + (context.currentTime - offset.time);
}

function setOffset(offset) {
  Session.set("offset", { value: offset, time: context.currentTime });
}

function isValidTransition(prevTransition, transition, debug) {
  if (debug) console.log(transition);

  // if not given a transition, immediate gg
  if (!transition) {
    if (debug) console.log("ERROR: transition undefined");
    return false;
  }

  // if given transition is "soft", it's definitely fine
  if (!transition._id) {
    return true;
  }

  // if given a prevTransition
  if (prevTransition) {

    // check to make sure transition fits with prevTransition
    if (prevTransition.endSong != transition.startSong) {
      if (debug) console.log("ERROR: given transition does not fit prevTransition");
      return false;
    }

    // if prevTransition is not soft, also make sure transition isn't too soon
    if (prevTransition._id &&
      (prevTransition.endTime > transition.startTime - Session.get("load_time"))) {
      if (debug) console.log("ERROR: given transition starts too soon after prevTransition");
      return false;
    }
  }

  // if no prevTransition
  if (!prevTransition) {

    // check to make sure this transition fits with the current song
    if (transition.startSong != Session.get("current_song")) {
      if (debug) console.log("ERROR: given transition does not fit currSong");
      return false;
    }

    // make sure we aren't too far in the current song
    if (getOffset() > transition.startTime - Session.get("load_time")) {
      if (debug) console.log("ERROR: too far in currSong to queue given transition");
      return false;
    }
  }

  // if we get here, we've passed all our validation checks
  return true;
}

function setCurrentSong(song) {
  Songs.update(song._id, { $inc: { playCount: 1 } });
  Session.set("current_song", song._id);
}
//
// /private methods
//