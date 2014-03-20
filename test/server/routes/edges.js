var request = require('supertest');

describe("#edges", function () {

  var app;
  
  before(function () {
    var db = require('../../../server/db');
    app = require('express')();
    require('../../../server/routes/edges')(app, db);
  });

  describe("GET /tracks/0/out", function () {
    it('responds with json', function (done) {
      request(app)
        .get('/tracks/0/out')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
});