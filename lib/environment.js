// 
// environment
// 
Meteor.startup(function() {

  // accounts
  Accounts.config({
    forbidClientAccountCreation: true
  });
  
});