Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    return [Meteor.subscribe('Songs'), Meteor.subscribe('Transitions'), Meteor.subscribe('Mixes')];
  }
});

Router.map(function() {

  this.route('/', function() {
    this.redirect('/linx/library');
  });

  this.route('/linx/:type', function() {
    var params = this.params;
    this.render('Linx', {
      data: function() {
        return params;
      }
    });
  });

  this.route('/linx/:type/:id', function() {
    var params = this.params;
    this.render('Linx', {
      data: function() {
        return params;
      }
    })    
  });

  this.route('Uploader', {
    path: '/uploader',
  });

});
