import React, { Component } from 'react';
import ReactCursorPosition from 'react-cursor-position';
import PlayfieldComponent from './components/PlayfieldComponent';
import CutoutComponent from './components/CutoutComponent';
import PlayfieldModel from './models/PlayfieldModel';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this._playfield = new PlayfieldModel();
    this.state = {
      width: this._playfield.width * 10,
      height: this._playfield.height * 10,
    };
  }
  render() {
    return (
      <div className="App">
        <header className="AppHeader">
          header is here
        </header>
        <div className="AppBody">
          <div className="AppPlayfieldContainer" >
            <ReactCursorPosition>
              <PlayfieldComponent playfield={this._playfield}/>
            </ReactCursorPosition>
          </div>
          <div className="AppDrawer">
            <CutoutComponent cutout="slingshot" />
          </div>
        </div>
        <div className="AppFooter">
          Footer hurray
        </div>
      </div>
    );
  }
}

export default App;
