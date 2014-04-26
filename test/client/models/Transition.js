var expect = require('chai').expect;
var Backbone = require('backbone');
Backbone.$ = require('jquery');
require('debug').enable('*');

var Edge = require('../../../client/models/Edge');
var Transition = require('../../../client/models/Transition');

describe("#Transition", function () {

  it("should fetchable from a soundcloud id", function (done) {
    var transition = new Transition({ 'id': 13158665 });
    transition.fetch({
      'success': function (model, response, options) {
        expect(model).to.exist;
        expect(typeof model.get('title')).equal('string');
        done();
      },
      'err': done,
    });
  });

  it("should constructable and fetchable from an edge", function (done) {
    var transition = new Transition({
      'edge': new Edge({
        'edgeId': 13158665,
      }),
    });
    expect(transition.id).to.equal(13158665);
    transition.fetch({
      'success': function (model, response, options) {
        expect(model).to.exist;
        expect(typeof model.get('title')).equal('string');
        done();
      },
      'err': done,
    });
  });

});