Meteor.startup(function () {
  Path = Npm.require('path');
  Future = Npm.require('fibers/future');
});

//
// echojs stuff
//
echoClient = Echojs({
  'key': 'CWBME38JDGQNEJPXT'
});

Meteor.methods({

  'echoID': function (data) {
    if (!Meteor.userId()) {
      return alert("WARNING: Server method called from user who was not logged in!");
    }
    var fut = new Future();
    echoClient('track/profile').get(data, function(err, json) {
      if (err) { fut['return'](console.log(err)); }
      fut['return'](json.response);
    });
    return fut.wait();
  },

  'searchEchoNest': function (data) {
    if (!Meteor.userId()) {
      return alert("WARNING: Server method called from user who was not logged in!");
    }
    var fut = new Future();
    echoClient('song/search').get(data, function(err, json) {
      if (err) { fut['return'](console.log(err)); }
      fut['return'](json.response);
    });
    return fut.wait();
  },

});


// wrap function in try/catch so that server won't reset on error
function exceptionWrapper(func, extra) {
  if (!Meteor.userId()) {
    return alert("WARNING: Server method called from user who was not logged in!");
  }
  return function() {
    try {
      return func.apply(this, arguments);
    } catch (e) {
      console.log("SERVER ERROR CAUGHT!");
      console.log(e);
      console.log(e.stack);
    }
  };
}