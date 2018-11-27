import React, { Component } from 'react';
import ReactCursorPosition from 'react-cursor-position';
import PlayfieldComponent from './components/PlayfieldComponent';
import CutoutEditorComponent from './components/CutoutEditorComponent';
import CutoutTypes from './models/CutoutTypes';
import CutoutModel from './models/CutoutModel';
import PlayfieldModel from './models/PlayfieldModel';

import './App.css';

class PlayfieldMakerApp extends Component {
  constructor(props) {
    super(props);
    this._playfield = new PlayfieldModel();
    this.state = {
      width: this._playfield.width * 10,
      height: this._playfield.height * 10,
      activeCutout: undefined,
      isSavedCutout: undefined,
    };
  }
  onCutoutAdd(e) {
    const cutoutType = this.refs.newCutoutType.value;
    const cutout = new CutoutModel(cutoutType, cutoutType, this._playfield);
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
    this._playfield.addCutout(this.state.activeCutout);
    this.setState({ activeCutout: undefined, isSavedCutout: undefined });
  }
  onCutoutCancel(cutout) {
    if (this._isSavedCutout === false) {
      this._playfield.removeCutout(cutout);
    }
    this.setState({ activeCutout: undefined, isSavedCutout: undefined });
  }
  render() {
    const { activeCutout } = this.state;
    return (
      <div className="App">
        <div className="AppPlayfieldContainer" >
          <ReactCursorPosition>
            <PlayfieldComponent
              playfield={this._playfield}
              cutouts={this._playfield.cutouts}
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
            {!activeCutout && (
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
