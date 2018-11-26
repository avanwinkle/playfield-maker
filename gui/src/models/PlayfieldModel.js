class PlayfieldModel {
  constructor(opts) {
    opts = opts || {};
    this.width = opts.width || 20.5;
    this.height = opts.height || 45.0;
    this._cutouts = [];
  }

  addCutout(cutoutInstance) {
    if (this._cutouts.indexOf(cutoutInstance) === -1) {
      this._cutouts.push(cutoutInstance);
    }
  }

  renderCutouts() {
    return this._cutouts.map((cutout) => {
      return cutout.generateRenderObject(this.width, this.height);
    });
  }
}

export default PlayfieldModel;