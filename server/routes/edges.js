var uuid = require('node-uuid');
var _ = require('underscore');

module.exports = function (app, db, graphdb) {
  
  // read collection
  app.get("/edges", function (req, res, next) {
    
    var edgeIn = req.query.in;
    var edgeOut = req.query.out;

    var query = {};
    if (edgeIn) query.subject = edgeIn;
    if (edgeOut) query.object = edgeOut;

    graphdb.get(query, function (err, results) {
      if (err) { return next(err); }
    
      res.json(200, results);
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

    graphdb.put(edge, function (err) {
      if (err) { return next(err); }

      res.json(200, edge);
    });
  });

  // read model
  app.get("/edges/:edgeId", function (req, res, next) {

    var query = {
      predicate: req.params.edgeId,
    };

    graphdb.get(query, function (err, results) {
      if (err) { return next(err); }

      if (results.length === 0) {

        res.json(404, undefined);

      } else {

        var edge = results[0];
        var result = {
          in: edge.subject,
          id: edge.predicate,
          out: edge.object,
          sample: edge.sample,
        };
        res.json(200, result);
      }
    });
  });

  // update model
  app.put("/edges/:edgeId", function (req, res, next) {

    var edgeId = req.params.edgeId;

    var query = {
      predicate: req.params.edgeId,
    };

    graphdb.get(query, function (err, results) {
      if (err) { return next(err); }

      if (results.length === 0) {

        res.json(404, undefined);

      } else {

        var edge = results[0];
        
        graphdb.del(edge, function (err) {
          if (err) { return next(err); }

          edge.subject = req.body.subject || edge.subject;
          edge.object = req.body.object || edge.object;
          edge.sample = req.body.sample || edge.sample;

          console.log(edge);

          graphdb.put(edge, function (err) {
            if (err) { return next(err); }

            var result = {
              in: edge.subject,
              id: edge.predicate,
              out: edge.object,
              sample: edge.sample,
            };

            res.json(200, result);
          });
        });
      }
    });
  });

  // delete model
  app.delete("/edges/:edgeId", function (req, res, next) {
    var edgeId = req.params.edgeId;
    var edge = {
      predicate: edgeId,
    };

    graphdb.get(edge, function (err, results) {
      if (err) { return next(err); }

      edge = results[0];

      graphdb.del(edge, function (err) {
        if (err) { return next(err); }
      
        res.json(200, undefined);
      });
    });
  });
};