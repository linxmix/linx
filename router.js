Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    return [Meteor.subscribe('Songs')];
  }
});

Router.map(function() {

  this.route('linx', {
    path: '/',
  });

  this.route('Uploader', {
    path: '/uploader',
  });

});
