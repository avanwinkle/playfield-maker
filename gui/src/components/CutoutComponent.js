import React, { Component } from 'react';
import SVG from 'react-inlinesvg';
import './CutoutComponent.css';

class CutoutComponent extends Component {
  constructor(props) {
    super(props);
    this._vectorUri = "cutouts/" + props.cutout.vector;
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
