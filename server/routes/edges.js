var uuid = require('node-uuid');

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

      console.log(arguments);

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

        var result = {
          in: results[0].subject,
          id: results[0].predicate,
          out: results[0].object,
          sample: results[0].sample,
        };
        res.json(200, result);
      }
    });
  });

  // update model
  app.put("/edges/:edgeId", function (req, res, next) {});

  // delete model
  app.delete("/edges/:edgeId", function (req, res, next) {});
};