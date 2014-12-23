Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    return [Meteor.subscribe('Songs'), Meteor.subscribe('Transitions'), Meteor.subscribe('Mixes')];
  }
});

Router.map(function() {

  this.route('/', function() {
    this.redirect('/linx');
  });

  this.route('Linx', {
    name: 'Linx',
    path: '/linx',
  });

  this.route('/linx/edit/:_id', function() {
    Session.set('editMix', this.params._id);
    console.log("edit');", Session.get('editMix'));
    this.render('MixList');
  });

  this.route('Uploader', {
    name: 'Uploader',
    path: '/uploader',
  });

});
