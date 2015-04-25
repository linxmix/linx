Template.topnav.helpers({
  loginText: function() {
    var user = Meteor.user();
    return user ? user.username : 'Login';
  }
});
