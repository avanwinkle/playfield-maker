import React, { Component } from 'react';
import './CutoutComponent.css';


class CutoutComponent extends Component {
  constructor(props) {
    super(props);
    this._vectorUri = "cutouts/" + props.cutout.cutoutType.vector;
    this._dataUri = ""
    props.cutout.onPositionChanged = this.onRenderPositionChanged.bind(this);
    this.state = {
      renderX: props.cutout.renderX,
      renderY: props.cutout.renderY,
      scale: props.cutout.scale,
    }
  }
  onRenderPositionChanged(x, y, scale) {
    this.setState({
      renderX: x,
      renderY: y,
      scale: scale,
    });
  }
  render() {
    if (!this.props.cutout._rawVector) { return null; }

    return (
      <div className="CutoutComponentContainer"
        style={{
          position: "absolute",
          left: this.state.renderX,
          top: this.state.renderY,
          transform: "scale(" + this.state.scale + ")",
          transformOrigin: "left top",
        }}>
        <div className="CutoutVector"
          dangerouslySetInnerHTML={{ __html: this.props.cutout._makerSvg }}
        />
      </div>
    );
  }
}

export default CutoutComponent;
