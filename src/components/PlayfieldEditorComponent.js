import React, { Component} from "react";

import FormControl from '@material-ui/core/FormControl';
import TextField from "@material-ui/core/TextField";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

class PlayfieldEditorComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedCutout: "" };
  }
  onCutoutSelect(e) {
    this.setState({ selectedCutout: e.target.value });
  }
  onCutoutAdd() {
    this.props.onCutoutAdd(this.state.selectedCutout);
  }
  render() {
    return (
      <form className="NewCutoutContainer">
        <div>
          <FormControl>
            <TextField name="PlayfieldName" label="Playfield Name"
              value={this.props.playfield.name}
              />
          </FormControl>
        </div>
        <div>
          <InputLabel>Add A Cutout</InputLabel>
          <FormControl>
            <Select value={this.state.selectedCutout} onChange={this.onCutoutSelect.bind(this)}>
            {Object.keys(this.props.cutoutTypes).map((cutoutType) => (
              <MenuItem name="cutoutType" value={cutoutType} key={cutoutType}>
                {this.props.cutoutTypes[cutoutType].name}
              </MenuItem>
            ))}
            </Select>
          </FormControl>
        </div>
        <input type="button" value="Add Cutout" onClick={this.onCutoutAdd.bind(this)}/>
      </form>
    );
  }
}

export default PlayfieldEditorComponent;
