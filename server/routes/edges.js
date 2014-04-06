var uuid = require('node-uuid');
var _ = require('underscore');
var Promise = require('bluebird');

module.exports = function (app, db, graphdb) {

  graphdb = Promise.promisifyAll(graphdb);
  
  // read collection
  app.get("/edges", function (req, res, next) {
    
    var edgeIn = req.query.in;
    var edgeOut = req.query.out;

    var query = {};
    if (edgeIn) query.subject = edgeIn;
    if (edgeOut) query.object = edgeOut;

    graphdb.getAsync(query).then(function (results) {
      console.log(results);
      res.json(200, results);
    }).catch(function (err) {
      return next(err);
    });
  });

  // create model
  app.post("/edges", function (req, res, next) {

    var edgeIn = req.body.in;

    var edgeId = req.body.id || uuid();
    var edgeOut = req.body.out;
    var sample = req.body.sample;

    var edge = {
      subject: edgeIn,
      predicate: edgeId,
      object: edgeOut,
      sample: sample,
    }

    graphdb.putAsync(edge).then(function () {
      res.json(200, edge);
    }).catch(function (err) {
      return next(err);
    });
  });

  // read model
  app.get("/edges/:edgeId", function (req, res, next) {

    var query = {
      predicate: req.params.edgeId,
    };

    graphdb.getAsync(query).then(function (results) {

      if (results.length === 0) {
        return res.json(404, undefined);
      }

      var edge = results[0];
      var result = {
        in: edge.subject,
        id: edge.predicate,
        out: edge.object,
        sample: edge.sample,
      };

      res.json(200, result);

    }).catch(function (err) {
      return next(err);
    });
  });

  // update model
  app.put("/edges/:edgeId", function (req, res, next) {

    var edgeId = req.params.edgeId;

    var query = {
      predicate: req.params.edgeId,
    };
    var edge;

    graphdb.getAsync(query).then(function (results) {

      if (results.length === 0) {
        res.json(404, undefined);
      }

      edge = results[0];
      
      return graphdb.delAsync(edge);
    }).then(function () {

      edge.subject = req.body.subject || edge.subject;
      edge.object = req.body.object || edge.object;
      edge.sample = req.body.sample || edge.sample;

      return graphdb.putAsync(edge);
    }).then(function () {

      var result = {
        in: edge.subject,
        id: edge.predicate,
        out: edge.object,
        sample: edge.sample,
      };

      res.json(200, result);

    }).catch(function (err) {
      return next(err);
    });
  });

  // delete model
  app.delete("/edges/:edgeId", function (req, res, next) {
    var edgeId = req.params.edgeId;
    var edge = {
      predicate: edgeId,
    };

    graphdb.getAsync(edge).then(function (results) {

      if (results.length === 0) {
        res.json(404, undefined);
      }

      edge = results[0];

      return graphdb.delAsync(edge);
    }).then(function () {
        res.json(200, undefined);
    }).catch(function (err) {
      if (err) { return next(err); }
    });
  });
};