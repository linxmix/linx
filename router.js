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
    return [Meteor.subscribe('Tracks'), Meteor.subscribe('Links'), Meteor.subscribe('Mixes') ];
  }
});

// redirect to tracks.link if we have two tracks
function assertLtTwoTracks() {
  var _idA = this.params._idA;
  var _idB = this.params._idB;
  if (Tracks.findOne(_idA) && Tracks.findOne(_idB)) {
    Router.go('tracks.link', { _idA: _idA, _idB: _idB });
  } else {
    this.render();
  }
}

// redirect to tracks.links if we don't have two tracks
function assertTwoTracks() {
  var _idA = this.params._idA;
  var _idB = this.params._idB;
  if (!(Tracks.findOne(_idA) && Tracks.findOne(_idB))) {
    Router.go('tracks.links', { _idA: _idA, _idB: _idB });
  } else {
    this.render();
  }
}

Router.map(function() {
  this.route('track', {
    path: '/tracks/:_id',
    template: 'TrackPage',
    data: function() {
      return {
        _id: this.params._id,
      };
    },
  });

  this.route('tracks.links', {
    path: '/tracks/:_idA/links/:_idB?',
    template: 'TracksLinksPage',
    yieldRegions: {
      'TrackLinksList': {to: 'details'},
    },
    data: function() {
      var _idA = this.params._idA;
      var _idB = this.params._idB;
      return {
        pageHeader: "Link Tracks",
        pageSubHeader: "Select Tracks",
        _idA: _idA,
        _idB: _idB,
        links: Utils.findAllLinks(_idA, _idB),
      };
    },
    onBeforeAction: assertLtTwoTracks,
  });

  this.route('tracks.link', {
    path: '/tracks/:_idA/links/:_idB/link/:_idLink?',
    template: 'TracksLinksPage',
    yieldRegions: {
      'TracksLinksList': {to: 'details'},
    },
    data: function() {
      var _idA = this.params._idA;
      var _idB = this.params._idB;
      return {
        pageHeader: "Track Links",
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
    path: '/tracks/links/:_idA/:_idB/edit',
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
