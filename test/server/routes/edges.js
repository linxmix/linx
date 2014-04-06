var request = require('supertest');

var delAll = function (db, done) {
  // del all objects in db
  db.createKeyStream()
  .on('data', function (k) {
    db.del(k);
  })
  .on('close', function () {
    done();
  });
};

describe("#edges", function () {

  var db, graphdb, app;
  var edge0 = {
    in: 'in',
    id: '0',
    out: 'out',
    sample: "link to sample"
  };
  
  before(function (done) {
    db = require('../../../server/db');
    graphdb = require('../../../server/graphdb');
    app = require('../../../server/server');
    delAll(db, done);
  });

  describe("GET /edges", function () {
    it('responds to empty query with empty array', function (done) {
      request(app)
        .get('/edges')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect([], done)
    });
    it('responds to not found query with empty array', function (done) {
      request(app)
        .get('/edges')
        .query({ in: 'notfound' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect([], done)
    });
  });

  describe("POST /edges", function () {
    it('responds with success', function (done) {
      request(app)
        .post('/edges')
        .send(edge0)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe("GET /edges/0", function () {
    it('responds with edge object', function (done) {
      request(app)
        .get('/edges/0')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(edge0, done);
    });
  });

  describe("PUT /edges/0", function () {

    edge0.sample = "link to other sample";

    it('responds with edge object', function (done) {
      request(app)
        .put('/edges/0')
        .send(edge0)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(edge0, done);
    });
  });

  describe("DELETE /edges/0", function () {
    it("responds with success", function (done) {
      request(app)
        .del('/edges/0')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe("GET /edges/0", function () {
    it("responds with 404", function (done) {
      request(app)
        .get('/edges/0')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404, done);
    });
  });

  after(function (done) {
    delAll(db, done);
  });
});