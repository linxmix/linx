var _ = require('underscore');
var Promise = require('bluebird');
var tv4 = require('tv4');

var edgesDb = require('../db/edges')

var queryEdgeSchema = {
  "type": "object",
  "properties": {
    "in": {
      "description": "id of track in to edge",
      "type": "string",
    },
    "edgeId": {
      "description": "id of edge track",
      "type": "string",
    },
    "out": {
      "description": "id of track out of edge",
      "type": "string"
    },
    "endIn": {
      "description": "end millseconds of track in",
      "type": "number",
    },
    "startEdge": {
      "description": "start millseconds of edge track",
      "type": "number",
    },
    "endEdge": {
      "description": "end millseconds of edge track",
      "type": "number",
    },
    "startOut": {
      "description": "start milliseconds of track out",
      "type": "number",
    },
  },
  "required": ["in", "out", "edgeId", "endIn", "startEdge", "endEdge", "startOut"],
};
var queryEdgeValidation = function (queryEdge) {
  return tv4.validateMultiple(queryEdge, queryEdgeSchema, true);
};

var queryEdgeToDbEdge = function (queryEdge) {
  queryEdge = queryEdge || {};

  return {
    subject: queryEdge.in,
    predicate: queryEdge.edgeId,
    object: queryEdge.out,
    endIn: queryEdge.endIn,
    startEdge: queryEdge.startEdge,
    endEdge: queryEdge.endEdge,
    startOut: queryEdge.startOut,
  };
};

var dbEdgeToQueryEdge = function (dbEdge) {
  dbEdge = dbEdge || {};

  return {
    in: dbEdge.subject,
    edgeId: dbEdge.predicate,
    out: dbEdge.object,
    endIn: dbEdge.endIn,
    startEdge: dbEdge.startEdge,
    endEdge: dbEdge.endEdge,
    startOut: dbEdge.startOut,
  };
};
var dbEdgeSchema = {};
var dbEdgeValidation = function () {};


module.exports = function (app) {

  edgesDb = Promise.promisifyAll(edgesDb);
  
  // read collection
  app.get("/edges", function (req, res, next) {
    
    var dbEdge = queryEdgeToDbEdge(req.query);

    edgesDb.getAsync(dbEdge).then(function (results) {
      res.json(200, results);
    }).catch(function (err) {
      return next(err);
    });
  });

  // create model
  app.post("/edges", function (req, res, next) {

    var queryEdge = req.body;

    var validation = queryEdgeValidation(queryEdge);

    if (!validation.valid) {
      return res.json(400, validation.errors);
    }

    var dbEdge = queryEdgeToDbEdge(queryEdge);

    edgesDb.putAsync(dbEdge).then(function () {
      res.json(200, queryEdge);
    }).catch(function (err) {
      return next(err);
    });
  });

  // read model
  app.get("/edges/:edgeId", function (req, res, next) {

    var getter = {
      predicate: req.params.edgeId,
    };

    edgesDb.getAsync(getter).then(function (results) {

      if (results.length === 0) {
        return res.json(404, undefined);
      }

      var dbEdge = results[0];

      var queryEdge = dbEdgeToQueryEdge(dbEdge);

      res.json(200, queryEdge);

    }).catch(function (err) {
      return next(err);
    });
  });

  // update model
  app.put("/edges/:edgeId", function (req, res, next) {

    var queryEdge = req.body;
    var getter = {
      predicate: req.params.edgeId,
    };
    var dbEdge;

    edgesDb.getAsync(getter).then(function (results) {

      if (results.length === 0) {
        res.json(404, undefined);
      }

      dbEdge = results[0];
      
      return edgesDb.delAsync(dbEdge);
    }).then(function () {


      var dbUpdates = queryEdgeToDbEdge(queryEdge);
      var queryExisting = dbEdgeToQueryEdge(dbEdge);

      dbEdge = _.extend(dbEdge, dbUpdates);
      queryEdge = _.extend(queryExisting, queryEdge);

      return edgesDb.putAsync(dbEdge);
    }).then(function () {

      res.json(200, queryEdge);

    }).catch(function (err) {
      return next(err);
    });
  });

  // delete model
  app.delete("/edges/:edgeId", function (req, res, next) {
    var getter = {
      predicate: req.params.edgeId,
    };

    edgesDb.getAsync(getter).then(function (results) {

      if (results.length === 0) {
        res.json(404, undefined);
      }

      edge = results[0];

      return edgesDb.delAsync(edge);
    }).then(function () {
        res.json(200, undefined);
    }).catch(function (err) {
      if (err) { return next(err); }
    });
  });
};