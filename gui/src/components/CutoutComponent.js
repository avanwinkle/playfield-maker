import React, { Component } from 'react';
import SVG from 'react-inlinesvg';
import Cutouts from '../models/Cutouts';
import './CutoutComponent.css';

class CutoutComponent extends Component {
  constructor(props) {
    super(props);
    console.log(Cutouts);
    this._cutout = Cutouts[props.cutout];
    this._vectorUri = "cutouts/" + this._cutout.vector;
  }
  render() {
    return (
      <div className="CutoutComponentContainer">
        <SVG className="CutoutVector" src={this._vectorUri} uniquifyIDs={false} />
      </div>
    );
  }
}

export default CutoutComponent;
