module.exports = function (app, db) {
  
  app.get("/out/:id", function (req, res, next) {

    var id = req.params.id;
      
    db.relationships(id, 'out', 'connects', function (err, result) {
      if (err) { return next(err); }
      res.json(result);
    });
  });
};