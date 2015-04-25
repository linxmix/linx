/* global Users: true */
/* global Accounts */

// Backed by Meteor.users collection
Users = Meteor.users;

Graviton.define('users', {
  timestamps: true,
});

// Accounts config
Meteor.startup(function() {
  if (Meteor.isClient) {
    Accounts.ui.config({
      passwordSignupFields: 'USERNAME_AND_EMAIL',
    });
  }
  Accounts.config({
    sendVerificationEmail: false,
  });
});
