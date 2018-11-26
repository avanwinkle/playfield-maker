import CutoutTypes from './CutoutTypes';

class CutoutModel {
  constructor(name, cutoutType, opts) {
    this.setName(name);
    if (!this.name) {
      throw Error("Invalid cutout name '" + name + "'");
    }
    if (!CutoutTypes[cutoutType]) {
      throw Error("Unknown cutout type '" + cutoutType + "'");
    }
    
    this.type = cutoutType;
    this.referencePoint = 0;
    this.anchor = 0;
    this.posX = 0.0;
    this.posY = 0.0;
    this.rotation = 0.0;

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
  }
  generateRenderObject(referenceWidth, referenceHeight) {
    return {
      vector: this.type.vector,
      x: this.posX,
      y: this.posY,
    };
  }
  setAnchor(anchor) {
    if (this._validateAnchorPoint(anchor)) {
      this.anchor = anchor;
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
      this.posX = x;
    }
    if (this._validateCoordinate(y)) {
      this.posY = y;
    }
    return this;
  }
  setReference(reference) {
    if (this._validateAnchorPoint(reference)) {
      this.referencePoint = reference;
    }
    return this;
  }
  setRotation(angle) {
    if (this._validateRotation(angle)) {
      this.rotation = angle;
    }
    return this;
  }
  _validateAnchorPoint(anchor) {
    if (typeof anchor !== "number" || anchor < 0 || anchor > 8) {
      console.error("Invalid anchor '" + anchor + "'");
      return false;
    }
    return true;
  }
  _validateCoordinate(pos) {
    if (pos === undefined || isNaN(pos)) {
      return false;
    }
    if (typeof pos !== "number") {
      console.error("Invalid coordinate position '" + pos +"'");
      return false;
    }
    return true;
  }
  _validateName(name) {
    if (typeof name !== "string") {
      console.error("Cutout name must be a string, received '" + name + "'");
      return false;
    } 
    if (name.match("[^A-Za-z0-9-_]")) {
      console.error("Cutout name must contain only letters, numbers, dash, or underscore: '" + name + "'");
      return false;
    }
    return true;
  }
  _validateRotation(angle) {
    if (typeof angle !== "number" || angle > 360 || angle < -360) {
      console.error("Invalid rotation angle '" + angle + "'");
      return false;
    }
    return true;
  }
}

export default CutoutModel;