import React, { Component } from "react";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import InputAdornment from '@material-ui/core/InputAdornment';

class CutoutEditorComponent extends Component {
  constructor(props) {
    super(props);
    this.initialValues = {
      anchor: props.cutout.anchor,
      name: props.cutout.name,
      posX: props.isSaved ? props.cutout.posX : undefined,
      pctX: props.isSaved ? props.cutout.pctX : undefined,
      posY: props.isSaved ? props.cutout.posY : undefined,
      pctY: props.isSaved ? props.cutout.pctY : undefined,
      referencePoint: props.cutout.referencePoint,
      unitsX: props.cutout.unitsX,
      unitsY: props.cutout.unitsY,
    }
    this.state = Object.assign({ errors: {} }, this.initialValues);
  }
  resetCutout() {
    this.props.cutout.validateAndSave(this.initialValues);
    this.props.onComplete();
  }
  setPosition(axis, scale, value) {
    var posKey = scale + axis;
    var altKey = (scale === "pct" ? "pos" : "pct" ) + axis;
    var unitsKey = "units" + axis;
    var result = { 
      [posKey]: parseInt(value * 1000) / 1000,
      [unitsKey]: scale,
    };
    this.setValue(result);
    this.setState({ 
      [posKey]: value,
      [altKey]: this.props.cutout[altKey],
    });
  }
  setValue(val) {
    this.setState(val);
    var result = this.props.cutout.validateAndSave(val);
    if (result) {
      this.setState({ errors: result });
    }
  }
  toggleUnits(axis) {
    if (axis === "x") {
      this.props.cutout.toggleXUnits();
      this.setState({
        unitsX: this.props.cutout.unitsX,
      });
    } else if (axis === "y") {
      this.props.cutout.toggleYUnits();
      this.setState({
        unitsY: this.props.cutout.unitsY,
      });
    }
  }
  render() {
    return (
      <div className="ActiveCutoutContainer">
        Active Cutout: {this.state.name} ({this.state.posX}, {this.state.posY})
        <TextField name="this.stateName" label="Name"
          value={this.state.name}
          error={this.state.errors.name}
          onChange={(e) => { this.setValue({ name: e.target.value }); }} />
        <div>
          <TextField name="this.stateX" label="X Position"
            value={this.state.posX}
            error={this.state.errors.posX}
            InputLabelProps={{ shrink: true }}
            placeholder="0"
            InputProps={{ endAdornment: <InputAdornment position="end">inches</InputAdornment> }}
            onChange={(e) => { this.setPosition("X", "pos", e.target.value)}} />
          <TextField name="this.stateX" label="X Percentage"
            value={this.state.pctX}
            error={this.state.errors.pctX}
            InputLabelProps={{ shrink: true }}
            placeholder="0"
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            onChange={(e) => { this.setPosition("X", "pct", e.target.value)}} />
        </div>
        <div>
          <TextField name="this.stateY" label="Y Position"
            value={this.state.posY}
            error={this.state.errors.posY}
            InputProps={{ endAdornment: <InputAdornment position="end">inches</InputAdornment> }}
            onChange={(e) => { this.setPosition("Y", "pos", e.target.value); }} />
          <TextField name="this.stateY" label="Y Percentage"
            value={this.state.pctY}
            error={this.state.errors.pctY}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            onChange={(e) => { this.setPosition("Y", "pct", e.target.value); }} />
        </div>
        <Button variant="text"
          onClick={() => this.resetCutout() }
        >Cancel</Button>
        <Button variant="contained"
          onClick={() => this.props.onComplete() }
        >Save Cutout</Button>
      </div>
    )
  }
}

export default CutoutEditorComponent;
