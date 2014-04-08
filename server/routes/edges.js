var _ = require('underscore');
var Promise = require('bluebird');
var tv4 = require('tv4');

var edgesDb = require('../db/edges')

var schema = {
  "type": "object",
  "properties": {
    "in": {
      "description": "id of track in to edge",
      "type": "string",
    },
    "id": {
      "description": "id of edge track",
      "type": "string",
    },
    "out": {
      "description": "id of track out of edge",
      "type": "string"
    },
    "start": {
      "description": "start sample of track in",
      "type": "number",
    },
    "end": {
      "description": "end sample of track out",
      "type": "number",
    },
  },
  "required": ["in", "out", "id", "start", "end"],
};

// functionalize edgeToGraphEdge
// functionalize graphEdgetoEdge
// functionalize validation of either

module.exports = function (app) {

  edgesDb = Promise.promisifyAll(edgesDb);
  
  // read collection
  app.get("/edges", function (req, res, next) {
    
    var edgeIn = req.query.in;
    var edgeOut = req.query.out;

    var query = {};
    if (edgeIn) query.subject = edgeIn;
    if (edgeOut) query.object = edgeOut;

    edgesDb.getAsync(query).then(function (results) {
      res.json(200, results);
    }).catch(function (err) {
      return next(err);
    });
  });

  // create model
  app.post("/edges", function (req, res, next) {

    var edge = req.body;

    var validation = tv4.validateMultiple(edge, schema, true);

    console.log(validation);

    if (!validation.valid) {
      return res.json(400, validation.errors);
    }

    var graphEdge = {
      subject: edge.in,
      predicate: edge.id,
      object: edge.out,
      start: edge.start,
      end: edge.end,
    };

    edgesDb.putAsync(graphEdge).then(function () {
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

    edgesDb.getAsync(query).then(function (results) {

      if (results.length === 0) {
        return res.json(404, undefined);
      }

      var graphEdge = results[0];

      var edge = {
        in: graphEdge.subject,
        id: graphEdge.predicate,
        out: graphEdge.object,
        start: graphEdge.start,
        end: graphEdge.end,
      };

      res.json(200, edge);

    }).catch(function (err) {
      return next(err);
    });
  });

  // update model
  app.put("/edges/:edgeId", function (req, res, next) {

    var query = {
      predicate: req.params.edgeId,
    };
    var graphEdge;

    edgesDb.getAsync(query).then(function (results) {

      if (results.length === 0) {
        res.json(404, undefined);
      }

      graphEdge = results[0];
      
      return edgesDb.delAsync(graphEdge);
    }).then(function () {

      graphEdge.subject = req.body.in || graphEdge.subject;
      graphEdge.object = req.body.out || graphEdge.object;
      graphEdge.start = req.body.start || graphEdge.start;
      graphEdge.end = req.body.end || graphEdge.end;

      return edgesDb.putAsync(graphEdge);
    }).then(function () {

      var edge = {
        in: graphEdge.subject,
        id: graphEdge.predicate,
        out: graphEdge.object,
        start: graphEdge.start,
        end: graphEdge.end,
      };

      res.json(200, edge);

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

    edgesDb.getAsync(edge).then(function (results) {

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