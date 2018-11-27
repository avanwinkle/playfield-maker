import CutoutTypes from './CutoutTypes';

class CutoutModel {
  constructor(cutoutType, playfield, opts) {
    if (!CutoutTypes[cutoutType]) {
      throw Error("Unknown cutout type '" + cutoutType + "'");
    }
    if (!playfield) {
      throw Error("Cutout instances require a playfield");
    }

    var cutoutSource = CutoutTypes[cutoutType];
    this._vectorUri = "cutouts/" + cutoutSource.vector;
    this._dpi = cutoutSource.dpi;

    this._playfield = playfield;
    this.cutoutType = cutoutType;

    this.scale = this._playfield.dpi / this._dpi;
    this.referencePoint = 0;
    this.anchor = 0;
    this.posX = 0.0;
    this.pctX = 0.0;
    this.unitsX = "in";
    this.posY = 0.0;
    this.pctY = 0.0;
    this.unitsY = "in";
    this.rotation = 0.0;
    this.name = this._playfield.generateCutoutName(cutoutType);

    opts = opts || {};
    if (opts.anchor) {
      this._setAnchor(opts.anchor)
    }
    if (opts.reference) {
      this._setReference(opts.reference);
    }
    if (opts.x || opts.y) {
      this.setPosition(opts.x, opts.y)
    }

    window.fetch(this._vectorUri).then((svg) => {
      svg.text().then((text) => {
        var parser = new DOMParser();
        var vectorParent = parser.parseFromString(text, "text/xml").getElementsByTagName("svg")[0];
        window.v = vectorParent;
        var paths = vectorParent.getElementsByTagName("path")
        for (var i=0; i<paths.length; i++) {
          paths[i].style = "";
          paths[i].style.fill = undefined;
          paths[i].style.stroke = undefined;
        }
        this._rawVector = vectorParent;
        this._vectorWidth = parseFloat(vectorParent.getAttribute("width"));
        this._vectorHeight = parseFloat(vectorParent.getAttribute("height"));
        this.calculateAbsolutePosition();
      });
    })
  }
  calculateAbsolutePosition() {
    if (!this._playfield) { return; }
    var offsetWidth = 0;
    var offsetHeight = 0;
    if ([1, 4, 7].indexOf(this.anchor) !== -1) {
      offsetWidth = this._vectorWidth / -2;
    } else if ([2, 5, 8].indexOf(this.anchor) !== -1) {
      offsetWidth = this._vectorWidth * -1;
    }
    if ([3, 4, 5].indexOf(this.anchor) !== -1) {
      offsetHeight = this._vectorHeight / -2;
    } else if ([6, 7, 8].indexOf(this.anchor) !== -1) {
      offsetHeight = this._vectorHeight * -1;
    }

    this.absoluteX = (this.unitsX === "pct" ? this._playfield.width * this.pctX / 100 : this.posX) + offsetWidth;
    this.absoluteY = (this.unitsY === "pct" ? this._playfield.height * this.pctY / 100: this.posY) + offsetHeight;
    if ([1, 4, 7].indexOf(this.referencePoint) !== -1) {
      this.absoluteX = (this._playfield.width / 2) + this.absoluteX;
    } else if ([2, 5, 8].indexOf(this.referencePoint) !== -1) {
      this.absoluteX = this._playfield.width + this.absoluteX;
    }
    if ([3, 4, 5].indexOf(this.referencePoint) !== -1) {
      this.absoluteY = (this._playfield.height / 2) + this.absoluteY;
    } else if ([6, 7, 8].indexOf(this.referencePoint) !== -1) {
      this.absoluteY = this._playfield.height + this.absoluteY
    }
    this.renderX = this.absoluteX * this._playfield.dpi;
    this.renderY = this.absoluteY * this._playfield.dpi;
    this.scale = this._playfield.dpi / this._dpi;

    if (this.onPositionChanged) {
      this.onPositionChanged(this.renderX, this.renderY, this.scale);
    }
  }
  setAnchor(anchor) {
    if (this._validateAnchorPoint(anchor)) {
      this.anchor = anchor;
      this.calculateAbsolutePosition()
    }
    return this;
  }
  setName(name) {
    if (this._validateName(name)) {
      this.name = name;
    }
    return this;
  }
  setPosition(x, y) {
    x = parseFloat(x);
    y = parseFloat(y);
    if (this._validateCoordinate(x)) {
      if (this.unitsX === "pct") {
        this.pctX = x;
        this.posX = this._playfield.width * x / 100;
      } else {
        this.posX = x;
        this.pctX = x / this._playfield.width * 100;
      }
    }
    if (this._validateCoordinate(y)) {
      if (this.unitsY === "pct") {
        this.pctY = y;
        this.posY = this._playfield.height * y / 100;
      } else {
        this.posY = y;
        this.pctY = y / this._playfield.height * 100;
      }
    }
    this.calculateAbsolutePosition();
    return this;
  }
  setReference(reference) {
    if (this._validateAnchorPoint(reference)) {
      this.referencePoint = reference;
      this.calculateAbsolutePosition();
    }
    return this;
  }
  setRotation(angle) {
    if (this._validateRotation(angle)) {
      this.rotation = angle;
    }
    return this;
  }
  toggleXUnits() {
    if (this.unitsX === "in") {
      this.unitsX = "pct";
    } else {
      this.unitsX = "in";
    }
    this.calculateAbsolutePosition();
    return this;
  }
  toggleYUnits() {
    if (this.unitsX === "in") {
      this.unitsY = "pct";
    } else {
      this.unitsY = "in";
    }
  }
  validateAndSave(opts) {
    var errs = {};
    [opts.anchor, opts.referencePoint].forEach((anchor) => {
      if (anchor !== undefined) {
        errs[anchor] = this._validateAnchorPoint(anchor);
      }
    });
    [opts.posX, opts.posY, opts.pctX, opts.pctY].forEach((pos) => {
      if (pos !== undefined) {
        errs[pos] = this._validateCoordinate(pos);
      }
    });
    if (opts.name !== undefined) {
      errs.name = this._validateName(opts.name);
    }
    if (opts.rotation !== undefined) {
      errs.rotation = this._validateRotation(opts.rotation);
    }
    if (Object.keys(errs).filter((key) => errs[key]).length) {
      return errs;
    }
    // Set the units first, to avoid miscalculations
    if (opts.unitsX) { this.unitsX = opts.unitsX; }
    if (opts.unitsY) { this.unitsY = opts.unitsY; }
    Object.keys(opts).forEach((key) => {
      if (opts[key] !== undefined) {
        if ((this.unitsX === "pct" && key === "pctX") || (this.unitsX === "in" && key === "posX")) {
          this.setPosition(opts[key], undefined);
        } else if ((this.unitsY === "pct" && key === "pctY") || (this.unitsY === "in" && key === "posY")) {
          this.setPosition(undefined, opts[key]);
        } else {
          this[key] = opts[key];
        }
      }
    });
    this.calculateAbsolutePosition();
  }
  _validateAnchorPoint(anchor) {
    if (typeof anchor !== "number" || anchor < 0 || anchor > 8) {
      return "Invalid anchor point";
    }
  }
  _validateCoordinate(pos) {
    if (pos === undefined || isNaN(pos)) {
      return "Coordinate is not a number";
    }
    if (typeof pos !== "number") {
      return "Invalid position";
    }
  }
  _validateName(name) {
    if (typeof name !== "string") {
      return "Cutout name must be a string";
    }
    if (name.match("[^A-Za-z0-9-_]")) {
      return "Cutout name must be alphanumeric, dash, or underscore.";
    }
    if (name === "") {
      return "Required";
    }
    return this._playfield.validateCutoutName(name);
  }
  _validateRotation(angle) {
    if (typeof angle !== "number" || angle > 360 || angle < -360) {
      return "Invalid angle";
    }
  }
}

export default CutoutModel;
