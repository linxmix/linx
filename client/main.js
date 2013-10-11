//
// startup
//
Meteor.startup(function() {

  // account ui button
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  // mini pages
  Meteor.pages({
    '/': { to: 'graphPage', nav: 'graphPage' },
    '/uploader': { to: 'uploaderPage', nav: 'uploaderPage' }
  });
  
});