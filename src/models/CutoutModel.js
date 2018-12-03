const makerjs = require("makerjs");

class CutoutModel {
  constructor(cutoutType, cutoutSchema, playfield, opts) {
    opts = opts || {};
    if (!cutoutType || !cutoutSchema) {
      throw Error("Unknown cutout type '" + cutoutType + "'");
    }
    if (!playfield) {
      throw Error("Cutout instances require a playfield");
    }

    this._vectorUri = "cutouts/" + cutoutSchema.vector;
    this._makerUri = "makers/" + cutoutType + ".json";
    this._dpi = cutoutSchema.dpi;

    this._playfield = playfield;
    this.cutoutType = cutoutType;

    this.id = opts.id || null;
    this.scale = this._playfield.dpi / this._dpi;
    this.anchorPoint = opts.anchorPoint || 0;
    this.originPoint = opts.originPoint || 0;
    this.posX = opts.posX || 0.0;
    this.pctX = opts.posY || 0.0;
    this.unitsX = opts.unitsX || "pos";
    this.posY = opts.posY || 0.0;
    this.pctY = opts.pctY || 0.0;
    this.unitsY = opts.unitsY || "pos";
    this.rotation = opts.rotation ||0.0;
    this.name = opts.name || this._playfield.generateCutoutName(cutoutType);

    window.fetch(this._vectorUri).then((svg) => {
      console.log("SVG:", svg);
      svg.text().then((text) => {
        var parser = new DOMParser();
        var vectorParent = parser.parseFromString(text, "text/xml").getElementsByTagName("svg")[0];
        window.v = vectorParent;
        var paths = vectorParent.getElementsByTagName("path")
        for (var i=0; i<paths.length; i++) {
          const path = paths[i];
          var style = path.getAttribute("style");
          if (style) {
            path.setAttribute("style", style.replace(/((fill|stroke):[^;]+;?)/g,""))
          }
        }
        this._rawVector = vectorParent;
        this._vectorWidth = parseFloat(vectorParent.getAttribute("width"));
        this._vectorHeight = parseFloat(vectorParent.getAttribute("height"));
        this.calculateAbsolutePosition();
      });
    });

    window.fetch(this._makerUri).then((maker) => maker.text() ).then((makerJson) => {
      try {
        var makerObj = JSON.parse(makerJson);
        console.log("MAKER", makerObj);
        this._makerSvg = makerjs.exporter.toSVG(makerObj);
      }
      catch {
        console.warn("Invalid json in makerObj for cutout type '" + cutoutType + "'");
      }
    });
  }
  calculateAbsolutePosition() {
    if (!this._playfield) { return; }
    var offsetWidth = 0;
    var offsetHeight = 0;
    if ([1, 4, 7].indexOf(this.originPoint) !== -1) {
      offsetWidth = this._vectorWidth / -2;
    } else if ([2, 5, 8].indexOf(this.originPoint) !== -1) {
      offsetWidth = this._vectorWidth * -1;
    }
    if ([3, 4, 5].indexOf(this.originPoint) !== -1) {
      offsetHeight = this._vectorHeight / -2;
    } else if ([0, 1, 2].indexOf(this.originPoint) !== -1) {
      offsetHeight = this._vectorHeight * -1;
    }

    this.absoluteX = (this.unitsX === "pct" ? this._playfield.width * this.pctX / 100 : this.posX) + offsetWidth;
    this.absoluteY = (this.unitsY === "pct" ? this._playfield.height * this.pctY / 100: this.posY) + offsetHeight;
    if ([1, 4, 7].indexOf(this.anchorPoint) !== -1) {
      this.absoluteX = (this._playfield.width / 2) + this.absoluteX;
    } else if ([2, 5, 8].indexOf(this.anchorPoint) !== -1) {
      this.absoluteX = this._playfield.width + this.absoluteX;
    }
    if ([3, 4, 5].indexOf(this.anchorPoint) !== -1) {
      this.absoluteY = (this._playfield.height / 2) + this.absoluteY;
    } else if ([0, 1, 2].indexOf(this.anchorPoint) !== -1) {
      this.absoluteY = this._playfield.height + this.absoluteY
    }
    this.renderX = this.absoluteX * this._playfield.dpi;
    this.renderY = this.absoluteY * this._playfield.dpi;
    this.scale = this._playfield.dpi / this._dpi;

    if (this.onPositionChanged) {
      this.onPositionChanged(this.renderX, this.renderY, this.scale);
    }
  }
  export() {
    var exp = {
      offsetX: this.absoluteX,
      offsetY: this.absoluteY,
      rotation: this.rotation ? [this.posX, this.posY, this.rotation] : undefined,
    }
    var fields = ["id", "name", "cutoutType", "anchorPoint", "originPoint", "posX", "pctX", "unitsX", "posY", "pctY", "unitsY"]
    fields.forEach((field) => { exp[field] = this[field] });
    return exp;
  }
  setOrigin(anchor) {
    if (this._validateAnchorPoint(anchor)) {
      this.originPoint = anchor;
      this.calculateAbsolutePosition()
    }
    return this;
  }
  setId(id) {
    if (this.id === null) {
      this.id = id;
    } else {
      throw Error("Cutout '" + this.name +"' already has id " + id + ", cannot overwrite");
    }
  }
  setName(name) {
    if (this._validateName(name)) {
      this.name = name;
    }
    return this;
  }
  setPosition(x, y, skipUpdate) {
    x = parseFloat(x);
    y = parseFloat(y);
    if (!this._validateCoordinate(x)) {
      if (this.unitsX === "pct") {
        this.pctX = x;
        this.posX = this.trimDecs(this._playfield.width * x / 100);
      } else {
        this.posX = x;
        this.pctX = this.trimDecs(x / this._playfield.width * 100);
      }
    }
    if (!this._validateCoordinate(y)) {
      if (this.unitsY === "pct") {
        this.pctY = y;
        this.posY = this.trimDecs(this._playfield.height * y / 100);
      } else {
        this.posY = y;
        this.pctY = this.trimDecs(y / this._playfield.height * 100);
      }
    }
    if (!skipUpdate) {
      this.calculateAbsolutePosition();
    }
    return this;
  }
  setReference(reference) {
    if (this._validateAnchorPoint(reference)) {
      this.anchorPoint = reference;
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
    if (this.unitsX === "pos") {
      this.unitsX = "pct";
    } else {
      this.unitsX = "pos";
    }
    this.calculateAbsolutePosition();
    return this;
  }
  toggleYUnits() {
    if (this.unitsX === "pos") {
      this.unitsY = "pct";
    } else {
      this.unitsY = "pos";
    }
  }
  trimDecs(float) {
    return parseInt(float * 1000) / 1000;
  }
  validateAndSave(opts) {
    var errs = {};
    ["originPoint", "anchorPoint"].forEach((anchor) => {
      if (opts[anchor] !== undefined) {
        errs[anchor] = this._validateAnchorPoint(opts[anchor]);
      }
    });
    ["posX", "posY", "pctX", "pctY"].forEach((pos) => {
      if (opts[pos] !== undefined) {
        errs[pos] = this._validateCoordinate(opts[pos]);
      }
    });
    if (opts.name !== undefined) {
      errs.name = this._validateName(opts.name);
    }
    if (opts.rotation !== undefined) {
      errs.rotation = this._validateRotation(opts.rotation);
    }
    if (Object.keys(errs).filter((key) => errs[key]).length) {
      console.warn("Cutout validateAndSave failed with errors:", errs);
      return errs;
    }
    // Set the units first, to avoid miscalculations
    if (opts.unitsX) { this.unitsX = opts.unitsX; }
    if (opts.unitsY) { this.unitsY = opts.unitsY; }
    Object.keys(opts).forEach((key) => {
      if (opts[key] !== undefined) {
        if (key === this.unitsX + "X") {
          this.setPosition(opts[key], undefined, true /* skipUpdate */);
        } else if (key === this.unitsY + "Y") {
          this.setPosition(undefined, opts[key], true /* skipUpdate */);
        } else if (["pctX", "posX", "pctY", "posY"].indexOf(key) !== -1) {
          // Don't force-set positions outside of the units
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
    return this._playfield.validateCutoutName(this.id, name);
  }
  _validateRotation(angle) {
    if (typeof angle !== "number" || angle > 360 || angle < -360) {
      return "Invalid angle";
    }
  }
}

export default CutoutModel;
