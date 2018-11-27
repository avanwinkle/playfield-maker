import React, { Component } from 'react';
import './CutoutComponent.css';

class CutoutComponent extends Component {
  constructor(props) {
    super(props);
    this._vectorUri = "cutouts/" + props.cutout.type.vector;
    this._dataUri = ""
    props.cutout.onPositionChanged = this.onRenderPositionChanged.bind(this);
    this.state = { renderX: 0, renderY: 0, scale: props.cutout.scale }
  }
  onRenderPositionChanged(x, y, scale) {
    this.setState({
      renderX: x,
      renderY: y,
      scale: scale,
    });
  }
  render() {
    return (
      <div className="CutoutComponentContainer"
        style={{
          position: "absolute",
          left: this.state.renderX,
          bottom: this.state.renderY,
          transform: "scale(" + this.state.scale + ")",
          transformOrigin: "left bottom",
        }}>
        <div className="CutoutVector"
          dangerouslySetInnerHTML={{ __html: this.props.cutout._rawVector.outerHTML }}
        />
      </div>
    );
  }
}

export default CutoutComponent;
