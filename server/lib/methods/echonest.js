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

  'identifySong': exceptionWrapper(function (data) {
    var fut = new Future();
    echoClient('track/profile').get(data, function(err, json) {
      if (err) { fut['return'](console.log(err)); }
      fut['return'](json.response);
    });
    return fut.wait();
  }),

  'searchEchoNest': exceptionWrapper(function (data) {
    var fut = new Future();
    echoClient('song/search').get(data, function(err, json) {
      if (err) { fut['return'](console.log(err)); }
      fut['return'](json.response);
    });
    return fut.wait();
  })

});


// wrap function in try/catch so that server won't reset on error
function exceptionWrapper(func, extra) {
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