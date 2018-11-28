import React, { Component } from "react";

import Radio from '@material-ui/core/Radio';
import "./AnchorSelectorComponent.css";

class AnchorSelectorComponent extends Component {
  render() {
  return (
    <div className="AnchorSelector">
      <div className="AnchorGrid" />
      <div className="AnchorRadioRow">
        <Radio value="6"
          checked={this.props.anchor === 6}
          onChange={this.props.onChange}
          classes={{ root: 'AnchorRadioButton' }}
        />
        <Radio value="7"
          checked={this.props.anchor === 7}
          onChange={this.props.onChange}
          classes={{ root: 'AnchorRadioButton' }}
        />
        <Radio value="8"
          checked={this.props.anchor === 8}
          onChange={this.props.onChange}
          classes={{ root: 'AnchorRadioButton' }}
        />
      </div>
      <div className="AnchorRadioRow">
        <Radio value="3"
          checked={this.props.anchor === 3}
          onChange={this.props.onChange}
          classes={{ root: 'AnchorRadioButton' }}
        />
        <Radio value="4"
          checked={this.props.anchor === 4}
          onChange={this.props.onChange}
          classes={{ root: 'AnchorRadioButton' }}
        />
        <Radio value="5"
          checked={this.props.anchor === 5}
          onChange={this.props.onChange}
          classes={{ root: 'AnchorRadioButton' }}
        />
      </div>
      <div className="AnchorRadioRow">
        <Radio value="0"
          checked={this.props.anchor === 0}
          onChange={this.props.onChange}
          classes={{ root: 'AnchorRadioButton' }}
        />
        <Radio value="1"
          checked={this.props.anchor === 1}
          onChange={this.props.onChange}
          classes={{ root: 'AnchorRadioButton' }}
        />
        <Radio value="2"
          checked={this.props.anchor === 2}
          onChange={this.props.onChange}
          classes={{ root: 'AnchorRadioButton' }}
        />
      </div>
    </div>
   )
  }
}

export default AnchorSelectorComponent;
