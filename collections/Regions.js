RegionModel = Graviton.Model.extend({
  belongsTo: {
    wave: {
      collectionName: 'waves',
      field: 'waveId'
    },
    link: {
      collectionName: 'links',
      field: 'linkId'
    },
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
      color: this.getColor(),
      data: this.get('data'),
    };
  },

  getColor: function() {
    return this.isActive() ? 'rgba(255, 255, 255, 1)' : this.get('color');
  },

  isActive: function() {
    var wave = this.wave();
    return this.hasLink(wave.linkTo()) || this.hasLink(wave.linkFrom());
  },

  destroy: function() {
    var regionWaveSurfer = this.getWaveSurferRegion();
    regionWaveSurfer.remove();
    this.remove();
  },

  getWaveSurfer: function() {
    return this.wave().getWaveSurfer();
  },

  getWaveSurferRegion: function() {
    return this.getWaveSurfer().regions.list[this.get('_id')];
  },

  draw: function() {
    var wavesurfer = this.getWaveSurfer();
    var params = this.getParams();
    var regionWaveSurfer = this.getWaveSurferRegion();
    if (!regionWaveSurfer) {
      // console.log("new regionWaveSurfer", params);
      regionWaveSurfer = wavesurfer.regions.add(params);
    } else {
      regionWaveSurfer.update(params);
    }
  },

  hasLink: function(link) {
    return link && (link.get('_id') === this.get('linkId'));
  },

});

Regions = Graviton.define("regions", {
  modelCls: RegionModel,
  persist: false,
  timestamps: true,
});
