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

Router.route('/login', {
  name: 'login',
});

Router.route('/upload', {
  name: 'Upload',
});

Router.route('/track/', {
  name: 'TrackIndexPage',
  data: function() {
    return Tracks.all();
  }
});

Router.route('/track/:_id', {
  name: 'TrackPage',
  data: function() {
    return Tracks.findOne(this.params._id);
  }
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
