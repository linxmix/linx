var expect = require('chai').expect;
var Backbone = require('backbone');
Backbone.$ = require('jquery');
require('debug').enable('*');

var Track = require('../../src/models/Track');

describe("#Track", function () {

  it("should fetchable from a soundcloud id", function (done) {
    var track = new Track({ 'id': 13158665 });
    track.fetch({
      'success': function (model, response, options) {
        expect(model).to.exist;
        expect(typeof model.get('title')).equal('string');
        done();
      },
      'err': done,
    });
  });

});