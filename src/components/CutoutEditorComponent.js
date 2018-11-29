import React, { Component } from "react";
import AnchorSelector from './AnchorSelectorComponent';

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import './CutoutEditorComponent.css';

class CutoutEditorComponent extends Component {
  constructor(props) {
    super(props);
    this.setInitialValues(props.cutout);
    this.state = Object.assign({ errors: {}, hasErrors: false }, this.initialValues);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.cutout.id !== this.props.cutout.id) {
      this.setInitialValues(this.props.cutout);
    }
  }
  deleteCutout() {
    var result = window.confirm("Delete this cutout from the playfield?");
    if (result) {
      this.props.onClose("DELETE");
    }
  }
  resetCutout() {
    // If this cutout is on the playfield, reset the initial values
    if (this.props.cutout.id) {
      // We use empty strings for input binding, but reset to undefined
      Object.keys(this.initialValues).forEach((key) => {
        if (this.initialValues[key] === "") {
          this.initialValues[key] = undefined;
        }
      });
      this.props.cutout.validateAndSave(this.initialValues);
    }
    this.props.onClose("CANCEL");
  }
  setInitialValues(cutout) {
    this.initialValues = {
      originPoint: cutout.originPoint,
      name: cutout.name,
      posX: cutout.posX || "",
      pctX: cutout.pctX || "",
      posY: cutout.posY || "",
      pctY: cutout.pctY || "",
      anchorPoint: cutout.anchorPoint,
      unitsX: cutout.unitsX,
      unitsY: cutout.unitsY,
    }
    if (this.state) {
      this.setState(Object.assign({ errors: {}, hasErrors: false }, this.initialValues));
    }
  }
  setPosition(axis, scale, value) {
    var posKey = scale + axis;
    var altKey = (scale === "pct" ? "pos" : "pct" ) + axis;
    var unitsKey = "units" + axis;
    var errs;
    // Set the text input value regardless of validation
    this.setState({ [posKey]: value, [unitsKey]: scale });
    var parsedValue = parseInt(value * 1000) / 1000;
    if (isNaN(parsedValue)) {
      if (value !== "-") {
        errs = this.state.errors;
        errs[posKey] = "Invalid value";
      }
    } else {
      var err = this.props.cutout.validateAndSave({ [posKey]: parsedValue, [unitsKey]: scale});
      if (err) {
        errs = this.state.errors;
        errs[posKey] = err;
      }
    }
    if (errs) {
      this.setState({ errors: errs, hasErrors: true });
      console.warn(errs);
    } else {
      this.setState({ [altKey]: this.props.cutout[altKey] });
    }
  }
  setValue(key, val) {
    var p = new Promise((resolve, reject) => {
      this.setState({ [key]: val }, () => {
        var result = this.props.cutout.validateAndSave({ [key]: val});
        if (result) {
          this.setState({ errors: result, hasErrors: true });
          reject(result);
        } else {
          this.setState({ [key]: this.props.cutout[key], errors: {}, hasErrors: false }, () => {
            resolve();
          });
        }
      });
    });
    return p;
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
          <FormControl>
            <TextField name="this.stateName" label="Name"
              value={this.state.name}
              error={!!this.state.errors.name}
              onChange={(e) => { this.setValue("name", e.target.value); }}
              />
            <FormHelperText error>{this.state.errors.name}</FormHelperText>
          </FormControl>
        </div>
        <div className="CutoutEditorRow">
          <div className="TextFieldPos">
            <FormControl>
              <TextField name="this.stateX" label="X Position"
                value={this.state.posX || ""}
                error={!!this.state.errors.posX}
                InputLabelProps={{ shrink: true }}
                placeholder="0.0"
                InputProps={{ endAdornment: <InputAdornment position="end">inches</InputAdornment> }}
                onChange={(e) => { this.setPosition("X", "pos", e.target.value)}} />
                <FormHelperText error>{this.state.errors.posX}</FormHelperText>
            </FormControl>
          </div>
          <div className="TextFieldPos">
            <FormControl>
              <TextField name="this.stateX" label="X Percentage"
                value={this.state.pctX || ""}
                error={this.state.errors && this.state.errors.pctX}
                InputLabelProps={{ shrink: true }}
                placeholder="0"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                onChange={(e) => { this.setPosition("X", "pct", e.target.value)}} />
              <FormHelperText error>{this.state.errors.pctX}</FormHelperText>
            </FormControl>
          </div>
          <div>
            <FormControl>
              <InputLabel shrink={true}>Origin</InputLabel>
              <AnchorSelector anchor={this.state.originPoint} onChange={(e) => this.setValue("originPoint", parseInt(e.target.value)) } />
              <FormHelperText error>{this.state.errors.originPoint}</FormHelperText>
            </FormControl>
          </div>
        </div>
        <div className="CutoutEditorRow">
          <div className="TextFieldPos">
            <FormControl>
              <TextField name="this.stateY" label="Y Position"
                value={this.state.posY || ""}
                error={this.state.errors && this.state.errors.posY}
                InputLabelProps={{ shrink: true }}
                placeholder="0.0"
                InputProps={{ endAdornment: <InputAdornment position="end">inches</InputAdornment> }}
                onChange={(e) => { this.setPosition("Y", "pos", e.target.value); }} />
              <FormHelperText error>{this.state.errors.posY}</FormHelperText>
            </FormControl>
          </div>
          <div className="TextFieldPos">
            <FormControl>
              <TextField name="this.stateY" label="Y Percentage"
                value={this.state.pctY || ""}
                error={this.state.errors && this.state.errors.pctY}
                InputLabelProps={{ shrink: true }}
                placeholder="0"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                onChange={(e) => { this.setPosition("Y", "pct", e.target.value); }} />
              <FormHelperText error>{this.state.errors.pctY}</FormHelperText>
            </FormControl>
          </div>
          <div>
            <FormControl>
              <InputLabel shrink={true}>Anchor</InputLabel>
              <AnchorSelector anchor={this.state.anchorPoint}
                onChange={(e) => this.setValue("anchorPoint", parseInt(e.target.value)) } />
              <FormHelperText error>{this.state.errors.anchorPoint}</FormHelperText>
            </FormControl>
          </div>
        </div>
        <div className="CutoutEditorRow">
          <Button variant="contained" color="primary"
            onClick={() => this.props.onClose("SAVE") }
            disabled={this.state.hasErrors}
          >{this.props.cutout.id ? "Save Changes" : "Save Cutout"}</Button>
        </div>
        <div className="CutoutEditorRow">
          <Button variant="text"
            onClick={this.resetCutout.bind(this)}
          >Cancel</Button>
          <div className="RowSpacer" />
          {this.props.cutout.id && (
            <Button variant="text"
              color="secondary"
              onClick={this.deleteCutout.bind(this)}
            >Delete Cutout</Button>
          )}
        </div>
      </div>
    )
  }
}

export default CutoutEditorComponent;
