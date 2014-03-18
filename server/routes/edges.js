module.exports = function (app, db) {
  
  // read collection
  app.get("/tracks/:trackId/out", function (req, res, next) {

    var trackId = req.params.trackId;
      
    db.relationships(trackId, 'out', 'connects', function (err, result) {
      if (err) { return next(err); }
      res.json(result);
    });
  });

  // create model
  app.post("/tracks/:trackId/out", function (req, res, next) {});

  // read model
  app.get("/tracks/:trackId/out/:edgeId", function (req, res, next) {});

  // update model
  app.put("/tracks/:trackId/out/:edgeId", function (req, res, next) {});

  // delete model
  app.delete("/tracks/:trackId/out/:edgeId", function (req, res, next) {});
};