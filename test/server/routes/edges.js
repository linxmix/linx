var request = require('supertest');

describe("#edges", function () {

  var db, neo, app;
  
  before(function (done) {
    require('../db')(function (err, db, neo) {
      if (err) { throw err; }
      db = db; // seraph object pointing to a real DB!
      neo = neo; // neo4j-supervisor object

      var app = require('express')();
      require('../../../server/routes/edges')(app, db);

      done();
    });
  });

  describe("GET /edges", function () {
    it('responds with json', function (done) {
      request(app)
        .get('/tracks/0/edges')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
});