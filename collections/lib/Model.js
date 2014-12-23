// Hack to allow non-mongo attributes
var oldFn = Model;
Model = function(collection) {

  var model = oldFn.apply(this, arguments);

  var oldIsMongoAttribute = model.isMongoAttribute;
  model.isMongoAttribute = function(prop) {
    if (this.nonMongoAttributes.hasOwnProperty(prop)) {
      return false;
    } else {
      return oldIsMongoAttribute(prop);
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
