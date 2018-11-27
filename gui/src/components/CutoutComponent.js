import React, { Component } from 'react';
import SVG from 'react-inlinesvg';
import './CutoutComponent.css';

class CutoutComponent extends Component {
  constructor(props) {
    super(props);
    this._vectorUri = "cutouts/" + props.cutout.type.vector;
    this._dataUri = ""
  }
  render() {
    return (
      <div className="CutoutComponentContainer"
        style={{ 
          position: "absolute", 
          left: this.props.cutout.renderX, 
          bottom: this.props.cutout.renderY,
          transform: "scale(" + this.props.cutout.scale + ")",
          transformOrigin: "left bottom",
        }}>
        <div className="CutoutVector" 
          dangerouslySetInnerHTML={{ __html: this.props.cutout._rawVector }} 
        />
      </div>
    );
  }
}

export default CutoutComponent;
