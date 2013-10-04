Handlebars.registerHelper("navClassFor", function (nav, options) {
  return Meteor.router.navEquals(nav) ? "active" : "";
});