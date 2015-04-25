// Augment Collection

// set default userId and isNew
var prevCreate = Mongo.Collection.prototype.create;
Mongo.Collection.prototype.create = function(obj, callback) {
  var user = Meteor.user();
  if (user) {
    obj = obj || {};
    obj.userId = user._id;
    if (typeof obj.isNew === 'undefined') {
      obj.isNew = false;
    }
  }
  return prevCreate.call(this, obj, callback);
};
