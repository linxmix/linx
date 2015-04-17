RegionModel = Graviton.Model.extend({
  belongsTo: {
    wave: {
      collectionName: 'waves',
      field: 'waveId'
    },
    link: {
      collectionName: 'links',
      field: 'linkId'
    }
  },
  defaults: {
    resize: false,
    drag: false,
    loop: false,
    color: 'black',
    start: 0,
    end: null,
    data: null,
  },
}, {
  getParams: function() {
    return {
      id: this.get('_id'),
      start: this.get('start'),
      end: this.get('end'),
      resize: this.get('resize'),
      drag: this.get('resize'),
      loop: this.get('resize'),
      color: this.get('color'),
      data: this.get('data'),
    };
  }
});

Regions = Graviton.define("regions", {
  modelCls: RegionModel,
  persist: false,
  timestamps: true,
});

// region params
// id: region.get('_id'),
// start: region.getTime(track.get('_id')),
// color: color,
