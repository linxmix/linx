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

  this.route('/linx/mix', function() {
    var mixId = Session.get('editMix');
    console.log("mixId", mixId);
    if (_.isEmpty(mixId)) {
      mixId = 'queue';
    }
    console.log("mixId", mixId);
    this.redirect('/linx/mix/' + mixId);
  });

  this.route('/linx/mix/:_id', function() {
    Session.set('editMix', this.params._id);
    this.render('MixList');
  });

  this.route('Upload', {
    name: 'Upload',
    path: '/upload',
  });
});
