LinxModel = {
  // make persist not change id
  persist: function() {
    this.db().remove(this._id);
    delete this._local;
    // delete this._id;
    this.save();
  },

  // refresh wave on model refresh
  refresh: function(){
    this.extend(this.getMongoAttributes(this.db().findOne(this._id)));
    if (this.getWave) {
      this.getWave().loadTrack(this);
    }
  },

  // fix StupidModel bug
  getMongoAttributes: function() {
    // TODO: do this
    console.log('getMongoAttributes');
  }
};
