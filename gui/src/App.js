import React, { Component } from 'react';
import ReactCursorPosition from 'react-cursor-position';
import PlayfieldComponent from './components/PlayfieldComponent';
import CutoutComponent from './components/CutoutComponent';
import CutoutTypes from './models/CutoutTypes';
import CutoutModel from './models/CutoutModel';
import PlayfieldModel from './models/PlayfieldModel';

import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import './App.css';

class PlayfieldMakerApp extends Component {
  constructor(props) {
    super(props);
    this._playfield = new PlayfieldModel();
    this.state = {
      width: this._playfield.width * 10,
      height: this._playfield.height * 10,
      activeCutout: undefined,
    };
  }
  onCutoutAdd(e) {
    const cutoutType = this.refs.newCutoutType.value;
    this.setState({ activeCutout: new CutoutModel(cutoutType, cutoutType) })
  }
  onCutoutEdit(cutout) {
    this.setState({ activeCutout: cutout });
  }
  onCutoutSave() {
    this._playfield.addCutout(this.state.activeCutout);
    this.setState({ activeCutout: undefined });
  }
  render() {
    const { activeCutout } = this.state;
    return (
      <div className="App">
        <header className="AppHeader">
          header is here
        </header>
        <div className="AppBody">
          <div className="AppPlayfieldContainer" >
            <ReactCursorPosition>
              <PlayfieldComponent playfield={this._playfield} onCutoutSelect={this.onCutoutEdit.bind(this)}/>
            </ReactCursorPosition>
          </div>
          <div className="AppDrawer">
            {activeCutout && (
              <div className="ActiveCutoutContainer">
                Active Cutout: {activeCutout.name} ({activeCutout.posX}, {activeCutout.posY})
                <TextField name="activeCutoutName" floatingLabelText="Name"
                  value={activeCutout.name}
                  onChange={(e, n) => { activeCutout.setName(n); this.setState({ activeCutout }) }} />
                <TextField name="activeCutoutX" floatingLabelText="X Position"
                  value={activeCutout.posX}
                  type="number"
                  onChange={(e, x) => { activeCutout.setPosition(x, undefined); this.setState({ activeCutout }) }} />
                <TextField name="activeCutoutY" floatingLabelText="Y Position"
                  value={activeCutout.posY}
                  type="number"
                  onChange={(e, y) => { activeCutout.setPosition(undefined, y); this.setState({ activeCutout }) }} />
                <RaisedButton
                  onClick={this.onCutoutSave.bind(this)}
                  label="Save Cutout"
                />
              </div>

            )}
            {!activeCutout && (
              <form className="NewCutoutContainer">
                <select ref="newCutoutType">
                  {Object.keys(CutoutTypes).map((cutoutType) => (
                    <option name="cutoutType" value={cutoutType} key={cutoutType}>{cutoutType}</option>
                  ))}
                </select>
                <input type="button" value="Add Cutout" onClick={this.onCutoutAdd.bind(this)}/>
              </form>
            )}
          </div>
        </div>
        <div className="AppFooter">
          Footer hurray
        </div>
      </div>
    );
  }
}

export default PlayfieldMakerApp;
