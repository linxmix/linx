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
Router.map(function() {
  this.route('test1', {
    path: '/test1',
    template: 'Test1',
    data: function() {
      return Tracks.all();
    }
  });

  this.route('test2', {
    path: '/test2',
    template: 'Test1',
    data: function() {
      return Tracks.all();
    }
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
