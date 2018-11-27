class PlayfieldModel {
  constructor(opts) {
    opts = opts || {};
    this.width = opts.width || 20.5;
    this.height = opts.height || 45.0;
    this.dpi = -1;
    this.cutouts = [];
  }

  addCutout(cutoutInstance) {
    if (this.cutouts.indexOf(cutoutInstance) === -1) {
      this.cutouts.push(cutoutInstance);
    }
  }
  removeCutout(cutoutInstance) {
    if (this.cutouts.indexOf(cutoutInstance) !== -1) {
      this.cutouts.splice(this.cutouts.indexOf(cutoutInstance), 1);
    }
  }
  setDPI(pixelWidth) {
    this.dpi = pixelWidth / this.width;
    this.cutouts.forEach((cutout) => {
      cutout.calculateAbsolutePosition();
    });
  }
}

export default PlayfieldModel;