import React, { Component } from 'react';
import ReactCursorPosition from 'react-cursor-position';
import PlayfieldComponent from './components/PlayfieldComponent';
import CutoutEditorComponent from './components/CutoutEditorComponent';
import CutoutModel from './models/CutoutModel';
import PlayfieldModel from './models/PlayfieldModel';

import './App.css';

class PlayfieldMakerApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCutout: undefined,
      isSavedCutout: undefined,
    };

    fetch("./data/cutoutTypes.json").then(response => response.json()).then((body) => {
      this.setState({ CutoutTypes: body });
      this._ipcRenderer.send("window-ready");
    });

    if (window.require) {
      this._ipcRenderer = window.require("electron").ipcRenderer;
      this._ipcRenderer.on("export-request", this._handleExportRequest.bind(this));
      this._ipcRenderer.on("preferences", this._handlePreferences.bind(this));
    } else {
      this._ipcRenderer = { send: () => {} };
    }
  }
  createCutout(cutoutType, playfield, opts) {
    return new CutoutModel(cutoutType, this.state.CutoutTypes[cutoutType], playfield, opts);
  }
  onCutoutAdd(e) {
    const cutoutType = this.refs.newCutoutType.value;
    const cutout = this.createCutout(cutoutType, this.state.playfield);
    this.setState({
      activeCutout: cutout,
      isSavedCutout: false,
    })
  }
  onCutoutEdit(cutout) {
    this.setState({
      activeCutout: cutout,
      isSavedCutout: true,
    });
  }
  onCutoutSave() {
    this.state.playfield.addCutout(this.state.activeCutout);
    this.setState({ 
      activeCutout: undefined, 
      isSavedCutout: undefined,
      cutouts: this.state.playfield.cutouts,
    });
  }
  onCutoutCancel(cutout) {
    if (this._isSavedCutout === false) {
      this.state.playfield.removeCutout(cutout);
    }
    this.setState({ 
      activeCutout: undefined, 
      isSavedCutout: undefined,
      cutouts: this.state.playfield.cutouts,
    });
  }
  _handleExportRequest(e, data) {
    this._ipcRenderer.send("export-ready", { format: "json", data: this.state.playfield.export() });
  }
  _handlePreferences(e, data) {
    const playfield = new PlayfieldModel(data.playfield);
    if (data.playfield && data.playfield.cutouts) {
      playfield.addCutouts(data.playfield.cutouts.map((cutout) => 
        this.createCutout(cutout.cutoutType, playfield, cutout) ));
    }
    this.setState({ 
      cutouts: playfield.cutouts,
      playfield: playfield,
    });
  }
  render() {
    const { activeCutout, CutoutTypes, playfield, cutouts } = this.state;
    return (
      <div className="App">
        <div className="AppPlayfieldContainer" >
          <ReactCursorPosition>
            <PlayfieldComponent
              playfield={playfield}
              cutouts={cutouts}
              onCutoutSelect={this.onCutoutEdit.bind(this)}
            />
          </ReactCursorPosition>
        </div>
        <div className="AppBody">
          <header className="AppHeader">

          </header>
          <div className="AppDrawer">
            {activeCutout && (
              <CutoutEditorComponent cutout={activeCutout}
                isSaved={this.state.isSavedCutout}
                onComplete={this.onCutoutSave.bind(this)}
                onCancel={this.onCutoutCancel.bind(this)}
              />
            )}
            {!activeCutout && CutoutTypes && (
              <form className="NewCutoutContainer">
                <select ref="newCutoutType">
                  {Object.keys(CutoutTypes).map((cutoutType) => (
                    <option name="cutoutType" value={cutoutType} key={cutoutType}>{CutoutTypes[cutoutType].name}</option>
                  ))}
                </select>
                <input type="button" value="Add Cutout" onClick={this.onCutoutAdd.bind(this)}/>
              </form>
            )}
          </div>
          <div className="AppFooter">

          </div>
        </div>
      </div>
    );
  }
}

export default PlayfieldMakerApp;
