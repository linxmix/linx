var _ = require('underscore');

var db = require('../db/edges')
var Edge = require('../models/edge');
var EdgeTriple = require('../models/edgeTriple');

module.exports = function (app) {
  
  // read collection
  app.get("/edges", function (req, res, next) {

    // get edge from request query
    var edge = req.query;

    // convert edge to triple
    var edgeTriple = EdgeTriple.fromEdge(edge);

    // get triple from db
    db.get(edgeTriple, function (err, triples) {
      if (err) { return next(err); }

      var edges = _.map(triples, function (triple) {
        // convert triple to edge
        return Edge.fromTriple(triple);
      });

      // return success and edges
      res.json(200, edges);
    });
  });

  // create model
  app.post("/edges", function (req, res, next) {

    // get edge from body
    var edge = req.body;

    // validate edge
    var validation = Edge.validation(edge);
    // if not valid, return 400 with errors
    if (!validation.valid) {
      return res.json(400, validation.errors);
    }

    // convert edge to triple for db
    var edgeTriple = EdgeTriple.fromEdge(edge);

    // put triple in db
    db.put(edgeTriple, function (err) {
      if (err) { return next(err); }

      // return success and edge
      res.json(200, edge);
    });
  });

  // read model
  app.get("/edges/:edgeId", function (req, res, next) {
    // TODO get all matching?
    // multiple edges can have same edgeId
    // as id for edges in entire triple

    // prepare db query from request's 'edgeId' param
    var getTriple = {
      predicate: req.params.edgeId,
    };

    // get edgeTriple from db
    db.get(getTriple, function (err, results) {
      if (err) { return next(err); }

      // if no triples found, return 404
      if (results.length === 0) {
        return res.json(404, undefined);
      }

      var edgeTriple = results[0];

      // convert triple to edge
      var edge = Edge.fromTriple(edgeTriple);

      // return success and edge
      res.json(200, edge);
    });
  });

  // update model
  app.put("/edges/:edgeId", function (req, res, next) {
    // TODO what about transactions?
    // TODO update all matching

    // levelgraph does not support in-place update,
    // as there are no constraint in the graph.
    // in order to update a triple, you should first
    // delete it.
    // https://github.com/mcollina/levelgraph#updating

    // prepare db query from request
    var edge = req.body;
    var getTriple = {
      predicate: req.params.edgeId,
    };

    // get existing edgeTriple from database
    db.get(getTriple, function (err, results) {
      if (err) { return next(err); }

      // if no edge found, return 404
      if (results.length === 0) {
        res.json(404, undefined);
      }

      var edgeTriple = results[0];
      
      // delete current triple
      db.del(edgeTriple, function (err) {
        if (err) { return next(err); }

        // convert edge from request to triple
        var tripleUpdates = EdgeTriple.fromEdge(edge);
        // convert triple from db to edge
        var edgeExisting = Edge.fromTriple(edgeTriple);

        // extend triple from db with triple from request
        edgeTriple = _.extend(edgeTriple, tripleUpdates);
        // extend edge from db with edge from request
        edge = _.extend(edgeExisting, edge);

        // put updated triple in db
        db.put(edgeTriple, function (err) {
          if (err) { return next(err); }

          // return success and edge
          res.json(200, edge);
        });
      });
    });
  });

  // delete model
  app.delete("/edges/:edgeId", function (req, res, next) {
    // TODO delete all matching

    // prepare db query from request
    var getTriple = {
      predicate: req.params.edgeId,
    };

    // get triples from db
    db.get(getTriple, function (err, triples) {
      if (err) { return next(err); }

      // if no triples found, return 
      if (triples.length === 0) {
        res.json(404, undefined);
      }

      edgeTriple = triples[0];

      // delete edgeTriple from db
      db.del(edgeTriple, function (err) {
        if (err) { return next(err); }

        // if success, return success
        res.json(200, undefined);
      });
    });
  });
};