import React, { Component} from "react";

import FormControl from '@material-ui/core/FormControl';
import TextField from "@material-ui/core/TextField";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from "@material-ui/core/Button";

class PlayfieldEditorComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playfieldId: props.playfield.id,
      filename: "",
      name: props.playfield.name,
      selectedCutout: -1
    };
  }
  onCutoutSelect(e) {
    this.setState({ selectedCutout: e.target.value });
  }
  onCutoutAdd() {
    this.props.onCutoutAdd(this.state.selectedCutout);
  }
  onNameChange(e) {
    this.setState({ name: e.target.value }, () => {
      if (this.state.name !== "") {
        this.props.playfield.setName(this.state.name);
        this.props.onSave();
      }
    });
  }
  onFileChange(e) {
    var isValidFilename = /^[A-Za-z0-9][\w\-. ]*$/.test(e.target.value);
    if (isValidFilename || e.target.value === "") {
      this.setState({ filename: e.target.value });
    }
  }
  onSavePlayfield() {
    this.props.playfield.setId(this.state.filename);
    this.props.onSave();
    this.setState({ playfieldId: this.props.playfield.id });
  }
  render() {
    return (
      <form className="CutoutEditorContainer">
        <div className="CutoutEditorRow">
          <FormControl>
            <TextField name="PlayfieldName" label="Playfield Name"
              value={this.state.name}
              onChange={this.onNameChange.bind(this)}
              />
          </FormControl>
        </div>
        <div className="CutoutEditorRow">
          <FormControl>
            <InputLabel shrink={true}>Add a Cutout</InputLabel>
            <Select value={this.state.selectedCutout} onChange={this.onCutoutSelect.bind(this)}>
              <MenuItem name="" value={-1}>--- Select a Cutout ---</MenuItem>
              {Object.keys(this.props.cutoutTypes).map((cutoutType) => (
                <MenuItem name="cutoutType" value={cutoutType} key={cutoutType}>
                  {this.props.cutoutTypes[cutoutType].name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="CutoutEditorRow">
          <Button variant="contained" color="primary"
            disabled={this.state.selectedCutout===-1}
            onClick={this.onCutoutAdd.bind(this)}
          >Add Cutout</Button>
        </div>
        {!this.state.playfieldId && (
          <div className="CutoutEditorRow">
            <FormControl>
              <TextField name="PlayfieldName" label="File Name"
                value={this.state.filename}
                onChange={this.onFileChange.bind(this)}
                />
            </FormControl>
            <Button variant="text" color="secondary"
              disabled={!this.state.filename}
              onClick={this.onSavePlayfield.bind(this)}
            >Save Playfield</Button>
          </div>
        )}
      </form>
    );
  }
}

export default PlayfieldEditorComponent;
