import Ember from 'ember';

function getStore(app) {
  return app.__container__.lookup('service:store');
}

var customHelpers = function() {
  Ember.Test.registerHelper('getStore', function(app) {
    return getStore(app);
  });

  Ember.Test.registerHelper('buildModel', function(app, model, attributes) {
    return getStore(app).createRecord(model, attributes || {});
  });
}();

export default customHelpers;
