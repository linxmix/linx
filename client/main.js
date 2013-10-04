//
// startup
//
Meteor.startup(function() {
  // accounts
  Accounts.config({
    forbidClientAccountCreation: true
  });
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Meteor.pages({
    '/': { to: 'graphPage', nav: 'graphPage' },
    '/uploader': { to: 'uploaderPage', nav: 'uploaderPage' }
  });
});