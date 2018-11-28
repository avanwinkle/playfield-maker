import React, { Component } from 'react';
import CutoutComponent from './CutoutComponent';
import './PlayfieldComponent.css';

const fractions = {
  0:   "",
  125: " 1/8",
  250: " 1/4",
  375: " 3/8",
  500: " 1/2",
  625: " 5/8",
  750: " 3/4",
  875: " 7/8",
}

function generateString(inch, dem) {
  if (fractions[dem] !== undefined) {
    return (<span>{inch}{fractions[dem]}&quot;</span>);
  }
  return (<span>{inch}.{dem.toString().replace(/0*$/,"")}&quot;</span>);
}

class PlayfieldComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      snapInterval: 125,
    };
  }
  updateWidth() {
    const height = this.el.clientHeight;
    const width = height * (this.props.playfield.width / this.props.playfield.height);
    this.props.playfield.setDPI(width);
    this.setState({ height, width });
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateWidth.bind(this));
  }
  componentDidUpdate(prevProps) {
    if (!prevProps.playfield && this.props.playfield) {
      this.updateWidth();
    }
  }
  render() {
    if (!this.props.playfield) { return null; }
    // Calculate the playfield coordinates based on the element size and relative cursor position
    const xPct = this.props.position.x / this.props.elementDimensions.width;
    const yPct = this.props.position.y / this.props.elementDimensions.height;
    const x = Math.floor(this.props.playfield.width * xPct * 1000);
    const y = Math.floor((this.props.playfield.height - (this.props.playfield.height * yPct)) * 1000);
    // Operate in thousandths of an inch
    let xIn = Math.floor(x/1000);
    const xDec = x % 1000;
    let yIn = Math.floor(y/1000);
    const yDec = y % 1000;
    // Round to the nearest increment based on the snap interval (by default, 1/8")
    let xDecRounded = Math.round(xDec / this.state.snapInterval) * this.state.snapInterval
    let yDecRounded = Math.round(yDec / this.state.snapInterval) * this.state.snapInterval
    if (xDecRounded === 1000) { xIn += 1; xDecRounded = 0; }
    if (yDecRounded === 1000) { yIn += 1; yDecRounded = 0; }

    return (
      <div className="Playfield" ref={ (el) => this.el = el } style={{ width: this.state.width }}>
        {this.props.isActive && (
          <div className="PlayfieldCursorPosition">
            <div>x: {generateString(xIn, xDecRounded)}</div>
            <div>y: {generateString(yIn, yDecRounded)}</div>
          </div>
        )}
        {this.props.cutouts.map((cutout) => (
          <div key={cutout.name} onClick={(e) => this.props.onCutoutSelect(cutout)}>
            <CutoutComponent cutout={cutout} />
          </div>
        ))}
      </div>
    )
  }
}

export default PlayfieldComponent;
