//
// server
//
Meteor.startup(function () {

  //
  // account stuff
  // 
  try {
    Accounts.createUser({
      username: "test",
      email: "wolfbiter@gmail.com",
      password: "fairuse",
      profile: { name: "welcome" }
    });
  } catch (e) {
    console.log("test account already exists");
  }
  
});