// Backed by Meteor.users collection
Users = Meteor.users;

Graviton.define('users', {
  timestamps: true,
});

// Accounts config
Meteor.startup(function() {
  if (Meteor.isClient) {
    Accounts.ui.config({
      passwordSignupFields: 'USERNAME_ONLY',
    });
  }
  Accounts.config({
    forbidClientAccountCreation: true,
    sendVerificationEmail: true,
  });
});
