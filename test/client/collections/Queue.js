var expect = require('chai').expect;
var Backbone = require('backbone');
Backbone.$ = require('jquery');

var Track = require('../../../client/models/Track');
var Transition = require('../../../client/models/Transition');
var Queue = require('../../../client/collections/Queue');

describe("#Queue", function () {
  var queue;

  it("should be constructable", function () {
    queue = new Queue({ id: "16730" });
    expect(queue).to.exist;
  });

  it("should be fetchable", function (done) {
    queue.fetch({
      'success': function (collection, response, options) {
        expect(data).to.exist;
        expect(data.id).to.equal(queue.id);
        done();
      },
      'error': done,
    });
  });

  var song1 = new Track({
    'id': 'song1',
    'duration': 10000, // 10 s
  });

  //it("can queue tracks", function () {
    // TODO
  //})


});
