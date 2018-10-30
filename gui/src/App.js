import React, { Component } from 'react';
import ReactCursorPosition from 'react-cursor-position';
import Playfield from './components/Playfield';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="AppHeader">
          header is here
        </header>
        <div className="AppBody">
          <div className="AppPlayfieldContainer">
            Left section is here
            <ReactCursorPosition>
              <Playfield />
            </ReactCursorPosition>
          </div>
          <div className="AppDrawer">
            Right section is here
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
