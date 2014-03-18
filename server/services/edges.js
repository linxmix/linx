module.exports = function (db) {
  return {
    find: function(params, callback) {
      var predicate = params.predicate || {};
      
      db.find(predicate, cb);
    },
    get: function(id, params, callback) {},
    create: function(data, params, callback) {},
    update: function(id, data, params, callback) {},
    remove: function(id, params, callback) {},
    setup: function(app) {},
  };
};