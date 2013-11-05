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
    '/uploader': { to: 'uploaderPage', nav: 'uploaderPage', before: [uploaderRedirects, resetUploader] },
    '/loading': { to: 'loadingPage', nav: 'loadingPage', before: [checkUploading] },
  });
  
});

// gives the uploader its redirects
function uploaderRedirects() {
  var self = this;
  Uploader.redirectToLoading = function () {
    self.redirect('/loading');
  }
  Uploader.redirectToUploader = function () {
    self.redirect('/uploader');
  }
}

// only reset uploader if we weren't already there in order to prevent infinite loop
function resetUploader() {
  if (Meteor.router.nav() !== "uploaderPage") {
    Uploader.reset();
  }
}

// only go to loading page if uploads are in progress
function checkUploading() {
  this.layout("loadingLayout");
  console.log(Session.get("uploads_in_progress"));
  if (!(Session.get("uploads_in_progress") >= 0)) {
    this.redirect('/');
  }
}