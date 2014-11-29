Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    return [Meteor.subscribe('Songs')];
  }
});

Router.map(function() {

  this.route('main', {
    path: '/',
  });

  this.route('Uploader', {
    path: '/uploader',
  });

});