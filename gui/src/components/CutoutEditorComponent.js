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
    this.setInitialValues(props.cutout, props.isSaved);
    this.state = Object.assign({ errors: {}, hasErrors: false }, this.initialValues);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.cutout.name !== this.props.cutout.name) {
      this.setInitialValues(this.props.cutout, this.props.isSaved);
    }
  }
  resetCutout() {
    this.props.cutout.validateAndSave(this.initialValues);
    this.props.onComplete();
  }
  setInitialValues(cutout, isSaved) {
    this.initialValues = {
      anchor: cutout.anchor,
      name: cutout.name,
      posX: isSaved ? cutout.posX : undefined,
      pctX: isSaved ? cutout.pctX : undefined,
      posY: isSaved ? cutout.posY : undefined,
      pctY: isSaved ? cutout.pctY : undefined,
      referencePoint: cutout.referencePoint,
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
      this.setState({ errors: result, hasErrors: true });
    } else {
      this.setState({ [key]: this.props.cutout[key], errors: {}, hasErrors: false });
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
                value={this.state.posX}
                error={!!this.state.errors.posX}
                InputLabelProps={{ shrink: true }}
                placeholder="0"
                InputProps={{ endAdornment: <InputAdornment position="end">inches</InputAdornment> }}
                onChange={(e) => { this.setPosition("X", "pos", e.target.value)}} />
                <FormHelperText error>{this.state.errors.posX}</FormHelperText>
            </FormControl>
          </div>
          <div className="TextFieldPos">
            <FormControl>
              <TextField name="this.stateX" label="X Percentage"
                value={this.state.pctX}
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
              <InputLabel shrink={true}>Anchor</InputLabel>
              <AnchorSelector anchor={this.state.anchor} onChange={(e) => this.setValue("anchor", parseInt(e.target.value)) } />
              <FormHelperText error>{this.state.errors.anchor}</FormHelperText>
            </FormControl>
          </div>
        </div>
        <div className="CutoutEditorRow">
          <div className="TextFieldPos">
            <FormControl>
              <TextField name="this.stateY" label="Y Position"
                value={this.state.posY}
                error={this.state.errors && this.state.errors.posY}
                InputLabelProps={{ shrink: true }}
                placeholder="0"
                InputProps={{ endAdornment: <InputAdornment position="end">inches</InputAdornment> }}
                onChange={(e) => { this.setPosition("Y", "pos", e.target.value); }} />
              <FormHelperText error>{this.state.errors.posX}</FormHelperText>
            </FormControl>
          </div>
          <div className="TextFieldPos">
            <FormControl>
              <TextField name="this.stateY" label="Y Percentage"
                value={this.state.pctY}
                error={this.state.errors && this.state.errors.pctY}
                InputLabelProps={{ shrink: true }}
                placeholder="0"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                onChange={(e) => { this.setPosition("Y", "pct", e.target.value); }} />
              <FormHelperText error>{this.state.errors.posX}</FormHelperText>
            </FormControl>
          </div>
          <div>
            <FormControl>
              <InputLabel shrink={true}>Reference Point</InputLabel>
              <AnchorSelector anchor={this.state.referencePoint}
                onChange={(e) => this.setValue("referencePoint", parseInt(e.target.value)) } />
              <FormHelperText error>{this.state.errors.referencePoint}</FormHelperText>
            </FormControl>
          </div>
        </div>
        <div className="CutoutEditorRow">
          <Button variant="text"
            onClick={() => this.resetCutout() }
          >Cancel</Button>
          <Button variant="contained"
            onClick={() => this.props.onComplete() }
            disabled={this.state.hasErrors}
          >Save Cutout</Button>
        </div>
      </div>
    )
  }
}

export default CutoutEditorComponent;
