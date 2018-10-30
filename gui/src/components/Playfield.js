import React, { Component } from 'react';
import './Playfield.css';

const fractions = {
  0.125: " 1/8",
  0.25: " 1/4",
  0.5: " 1/2",
  0.75: " 3/4",
  0.875: " 7/8",  
}

function generateString(inch, dem) {
  if (fractions[dem]) {
    return (<span>{inch}{fractions[dem]}&quot;</span>);
  }
  return (<span>{inch + dem}&quot;</span>);
}

class Playfield extends Component {
  render() {
    const x = this.props.position.x;
    const y = this.props.elementDimensions.height - this.props.position.y;

    const xIn = Math.floor(x/10);
    const xDec = (x/10) % 1;
    const yIn = Math.floor(y/10);
    const yDec = (y/10) % 1;
    return (
      <div className="Playfield">
        <div>x: {generateString(xIn, xDec)}</div>
        <div>y: {generateString(yIn, yDec)}</div>
      </div>
    )
  }
}

export default Playfield;