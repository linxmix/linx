import Ember from 'ember';

// all uncaught errors will be caught here
// you can use `message` to make sure it's the error you're looking for
// returning true overrides the default window behaviour
window.onerror = function(message, file, lineNumber, columnNumber, error) {
  console.warn(message, error && error.stack);
  window.error = error;
  return true;
};

export default {
  name: 'CatchErrors',

  initialize: function(app) {
  },
};
