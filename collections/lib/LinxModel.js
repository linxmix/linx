LinxModel = {

  // fix StupidModel bug
  refresh: function() {
    this.extend(this.getMongoAttributes(this.db().findOne(this._id)));
  },

  // fix StupidModel bug
  getMongoAttributes: function(includeId) {
    var mongoValues = {};
    for(var prop in this) {
      if (this.hasOwnProperty(prop) && this.isMongoAttribute(prop)) {
        mongoValues[prop] = this[prop];
      }
    }

    if (includeId) {
      mongoValues._id = this._id;
    }

    return mongoValues;
  }
};
