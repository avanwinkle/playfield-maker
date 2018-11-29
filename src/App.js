import React, { Component } from 'react';
import ReactCursorPosition from 'react-cursor-position';
import PlayfieldComponent from './components/PlayfieldComponent';
import CutoutEditorComponent from './components/CutoutEditorComponent';
import PlayfieldEditorComponent from './components/PlayfieldEditorComponent';
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
  onCutoutAdd(cutoutType) {
    const cutout = this.createCutout(cutoutType, this.state.playfield);
    this.onCutoutEdit(cutout);
  }
  onCutoutEdit(cutout) {
    this.setState({ activeCutout: cutout });
  }
  onCutoutEditClose(action) {
    switch(action) {
      case "SAVE":
        this.state.playfield.addCutout(this.state.activeCutout);
        break;
      case "DELETE":
        this.state.playfield.removeCutout(this.state.activeCutout);
        break;
      case "CANCEL":
      default:
        break;
    }
    this.setState({
      activeCutout: undefined,
      cutouts: this.state.playfield.cutouts,
    });
    this._savePlayfield();
  }
  _handleExportRequest(e, data) {
    this._ipcRenderer.send("export", { action: "SVG", filename: this.state.playfield.id, data: this.state.playfield.export() });
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
  _savePlayfield() {
    if (this.state.playfield.id) {
      this._ipcRenderer.send("export", { action: "SAVE", filename: this.state.playfield.id, data: this.state.playfield.export() });
    }
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
                onClose={this.onCutoutEditClose.bind(this)}
              />
            )}
            {!activeCutout && playfield && CutoutTypes && (
              <PlayfieldEditorComponent
                playfield={playfield}
                cutoutTypes={CutoutTypes}
                onCutoutAdd={this.onCutoutAdd.bind(this)}
                onSave={this._savePlayfield.bind(this)}
              />
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
