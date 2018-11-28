class PlayfieldModel {
  constructor(opts) {
    opts = opts || {};
    this.width = opts.width || 20.5;
    this.height = opts.height || 45.0;
    this.dpi = -1;
    this.cutouts = [];
    window.playfield = this;
  }
  addCutout(cutoutInstance) {
    if (this.cutouts.indexOf(cutoutInstance) === -1) {
      this.cutouts.push(cutoutInstance);
    }
  }
  export() {
    return JSON.stringify({
      name: "playfield",
      cutouts: this.cutouts.map((cutout) => cutout.export()),
      width: this.width,
      height: this.height,
    })
  }
  generateCutoutName(cutoutType) {
    var count = 1;
    var existingNames = [];
    this.cutouts.forEach((cutout) => {
      if (cutout.cutoutType === cutoutType) {
        existingNames.push(cutout.name);
        count++;
      }
    });
    var newName = cutoutType + "_" + count;
    while (existingNames.indexOf(newName) !== -1) {
      count++;
      newName = cutoutType + "_" + count;
    }
    return newName;
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
  validateCutoutName(name) {
    var valid;
    this.cutouts.forEach((cutout) => {
      if (cutout.name === name) {
        valid = "Name already in use";
      }
    });
    return valid;
  }
}

export default PlayfieldModel;
