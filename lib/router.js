Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  // load: function() {
  //   $('.content').animate({
  //     left: "-1000px",
  //     scrollTop: 0
  //   }, 400, function() {
  //       $(this).animate({ left: "0px" }, 400);
  //   });
  //   this.next();
  // },
  waitOn: function() {
    return [Meteor.subscribe('Tracks'), Meteor.subscribe('Links'), Meteor.subscribe('Mixes'), Meteor.subscribe('Songs'), Meteor.subscribe('Transitions') ];
  }
});

// redirect to tracks.link if we have two tracks
function assertLtTwoTracks() {
  var _idA = this.params._idA;
  var _idB = this.params._idB;
  if (Tracks.findOne(_idA) && Tracks.findOne(_idB)) {
    Router.go('tracks.links', { _idA: _idA, _idB: _idB });
  } else {
    this.render();
  }
}

function getTrackIds(params) {
  var _idA = params._idA;
  var _idB = params._idB;
  var _ids = [_idA, _idB];
  return _ids.reduce(function(_ids, _id) {
    if (Tracks.findOne(_id)) {
      _ids.push(_id);
    }
    return _ids;
  }, []);
}

// redirect to track.links if we don't have two tracks
function assertTwoTracks() {
  var _idTracks = getTrackIds(this.params);
  if (_idTracks.length !== 2) {
    Router.go('track.links', {
      _idA: this.params._idA,
      _idB: this.params._idB,
      _idActive: _idTracks[0],
    });
  } else {
    this.render();
  }
}

Router.map(function() {
  this.route('login', {
    path: '/login',
    template: 'login',
  });

  // Mix Routes
  this.route('mix.new', {
    path: '/mixes/new',
    template: 'MixPage',
    data: function() {
      var newMix = Utils.createLocalModel(Mixes);
      return {
        _id: newMix.get('_id')
      };
    }
  });

  this.route('mix', {
    path: '/mixes/:_id',
    template: 'MixPage',
    data: function() {
      return {
        _id: this.params._id,
      };
    },
  });

  // Track Routes
  this.route('track', {
    path: '/tracks/:_id',
    template: 'TrackPage',
    data: function() {
      return {
        _id: this.params._id,
      };
    },
  });

  // Track Link Routes
  this.route('track.links', {
    path: '/tracks/:_idA/links/:_idB?',
    template: 'TracksLinksPage',
    yieldRegions: {
      'TrackLinksList': {to: 'details'},
    },
    data: function() {
      var _idA = this.params._idA;
      var _idB = this.params._idB;
      var _idTracks = getTrackIds(this.params);

      return {
        pageHeader: "Track Links",
        pageSubHeader: "Select Tracks",
        _idA: _idA,
        _idB: _idB,
        _idTrack: _idTracks[0],
        // links: Utils.findAllLinks(_idA, _idB),
      };
    },
    onBeforeAction: assertLtTwoTracks,
  });

  this.route('tracks.links', {
    path: '/tracks/:_idA/links/:_idB/link/:_idLink?',
    template: 'TracksLinksPage',
    yieldRegions: {
      'TracksLinksList': {to: 'details'},
    },
    data: function() {
      var _idA = this.params._idA;
      var _idB = this.params._idB;

      return {
        pageHeader: "Link Tracks",
        pageSubHeader: "Select Link",
        _idA: _idA,
        _idB: _idB,
        links: Utils.findAllLinks(_idA, _idB),
        selectedLink: this.params._idLink
      };
    },
    onBeforeAction: assertTwoTracks,
  });

  this.route('tracks.link.edit', {
    path: '/tracks/:_idA/links/:_idB/edit',
    template: 'TracksLinksEditPage',
    yieldRegions: {
      'TracksLinksEditList': {to: 'details'},
    },
    data: function() {
      var _idA = this.params._idA;
      var _idB = this.params._idB;
      return {
        pageHeader: "Edit Links",
        pageSubHeader: "Select Link",
        _idA: _idA,
        _idB: _idB,
        links: Utils.findAllLinks(_idA, _idB),
      };
    },
    onBeforeAction: assertTwoTracks,
  });
});

// Router.onBeforeAction(function () {
//   // all properties available in the route function
//   // are also available here such as this.params
//   console.log("onBeforeAction", Meteor.userId());
//   if (!Meteor.userId()) {
//     // if the user is not logged in, redirect to login
//     this.redirect('login');
//   } else {
//     this.next();
//   }
// });
