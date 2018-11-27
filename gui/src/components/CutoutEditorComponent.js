import React, { Component } from "react";
import AnchorSelector from './AnchorSelectorComponent';

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import InputAdornment from '@material-ui/core/InputAdornment';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import './CutoutEditorComponent.css';

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
    // Set the text input value regardless of validation
    this.setState({ [posKey]: value });
    var parsedValue = parseInt(value * 1000) / 1000;
    if (!isNaN(parsedValue) && !this.props.cutout.validateAndSave({ [posKey]: parsedValue})) {
      this.setValue(unitsKey, scale);
      this.setState({ [altKey]: this.props.cutout[altKey] });
    }
  }
  setValue(key, val) {
    this.setState({ [key]: val });
    var result = this.props.cutout.validateAndSave({ [key]: val});
    if (result) {
      this.setState({ errors: result });
    } else {
      this.setState({ [key]: this.props.cutout[key] });
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
      <div className="CutoutEditorContainer">
        <div className="CutoutEditorRow">
          <TextField name="this.stateName" label="Name"
            value={this.state.name}
            error={this.state.errors.name}
            onChange={(e) => { this.setValue("name", e.target.value); }} />
        </div>
        <div className="CutoutEditorRow">
          <div className="TextFieldPos">
            <TextField name="this.stateX" label="X Position"
              value={this.state.posX}
              error={this.state.errors.posX}
              InputLabelProps={{ shrink: true }}
              placeholder="0"
              InputProps={{ endAdornment: <InputAdornment position="end">inches</InputAdornment> }}
              onChange={(e) => { this.setPosition("X", "pos", e.target.value)}} />
          </div>
          <div className="TextFieldPos">
            <TextField name="this.stateX" label="X Percentage"
              value={this.state.pctX}
              error={this.state.errors.pctX}
              InputLabelProps={{ shrink: true }}
              placeholder="0"
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              onChange={(e) => { this.setPosition("X", "pct", e.target.value)}} />
          </div>
          <div>
            <FormLabel>Anchor</FormLabel>
            <AnchorSelector anchor={this.state.anchor} onChange={(e) => this.setValue("anchor", parseInt(e.target.value)) } />
          </div>
        </div>
        <div className="CutoutEditorRow">
          <div className="TextFieldPos">
            <TextField name="this.stateY" label="Y Position"
              value={this.state.posY}
              error={this.state.errors.posY}InputLabelProps={{ shrink: true }}
              placeholder="0"
              InputProps={{ endAdornment: <InputAdornment position="end">inches</InputAdornment> }}
              onChange={(e) => { this.setPosition("Y", "pos", e.target.value); }} />
          </div>
          <div className="TextFieldPos">
            <TextField name="this.stateY" label="Y Percentage"
              value={this.state.pctY}
              error={this.state.errors.pctY}InputLabelProps={{ shrink: true }}
              placeholder="0"
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              onChange={(e) => { this.setPosition("Y", "pct", e.target.value); }} />
          </div>
          <div>
            <InputLabel shrink={true}>Reference Point</InputLabel>
            <AnchorSelector anchor={this.state.referencePoint} onChange={(e) => this.setValue("referencePoint", parseInt(e.target.value)) } />
          </div>
        </div>
        <div className="CutoutEditorRow">
          <Button variant="text"
            onClick={() => this.resetCutout() }
          >Cancel</Button>
          <Button variant="contained"
            onClick={() => this.props.onComplete() }
          >Save Cutout</Button>
        </div>
      </div>
    )
  }
}

export default CutoutEditorComponent;
