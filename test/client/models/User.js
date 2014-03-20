var expect = require('chai').expect;
var Backbone = require('backbone');
Backbone.$ = require('jquery');

var User = require('../../../client/models/User');

describe("#User", function () {
  var user;

  it("should be constructable", function () {
    user = new User({ id: "16730" });
    expect(user).to.exist;
  });

  it("should be fetchable", function (done) {
    user.fetch({
      success: function (data) {
        expect(data).to.exist;
        expect(data.id).to.equal(user.id);
        done();
      },
      error: function (err) {
        expect(err).to.not.exist;
      },
    });
  });
});
