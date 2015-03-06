LinxModel = {
  // fix StupidModel bug
  refresh: function(){
    this.extend(this.getMongoAttributes(this.db().findOne(this._id)));
  },

  // fix StupidModel bug
  getMongoAttributes: function() {
    console.log('getMongoAttributes');
  },
};


/*
// TODO: convert whatever i was doing to above
LinxModel = function(collection) {

  var model = _Model.apply(this, arguments);

  // Hack to allow non-mongo attributes
  var _isMongoAttribute = model.isMongoAttribute;
  model.isMongoAttribute = function(prop) {
    if (this.nonMongoAttributes.hasOwnProperty(prop)) {
      return false;
    } else {
      return _isMongoAttribute(prop);
    }
  };

  model.nonMongoAttributes = {};
  model.addNonMongoAttributes = function(props) {
    props.forEach(function(prop) {
      this.nonMongoAttributes[prop] = true;
    }.bind(this));
  };

  // default non-mongo props
  model.addNonMongoAttributes(['nonMongoAttributes']);

  return model;
};
*/
