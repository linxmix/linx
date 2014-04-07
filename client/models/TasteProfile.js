var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  defaults: function() {
    console.log("MAKING MODEL", this, this.get('cid'));
    return {
      country: false,
      region: false
    };
  }

  "sync": mySyncFunction,

});

// TODO: write this to sync to the echonest api
function mySyncFunction(method, model, options){
  console.log("SYNCING MODEL", model, model.url);
  if(method=='GET'){
    options.url = model.url; 
  }else{
     options.url = model.url + '/save'; 
  }
  return Backbone.sync(method, model, options);
}