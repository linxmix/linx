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
    '/uploader': { to: 'uploaderPage', nav: 'uploaderPage', before: [resetUploader] },
  });
  
});

// only reset uploader if we weren't already there in order to prevent infinite loop
function resetUploader() {
  if (Meteor.router.nav() !== "uploaderPage") {
    Uploader.reset();
  }
}