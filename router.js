Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    console.log("router start");
    return [Meteor.subscribe('Songs')];
  }
});

Router.map(function() {

  this.route('hello', {
    path: '/',
  });

  this.route('Uploader', {
    path: '/uploader',
  });

});