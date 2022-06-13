import React from "react";
import { Checkbox } from "antd";
import { commonPropTypes, booleanPropTypes} from "./attributePropTypes";
import { commonDefaultProps, booleanDefaultProps } from "./attributeDefaultProps";


class BooleanAttribute extends React.Component {

  readElement() {
      return this.props.value ? 'Oui' : 'Non';
  }

  writeElement() {
    return (
      <div className="attribute-input-container">
        <Checkbox
          id={this.props.attributeId}
          defaultChecked={this.props.value}
          className="attribute-input"
          onChange={(e) => this.props.onChange(e.target.checked)}
        />
      </div>
    )
  }

  render() {
    if (this.props.editMode) {
      return this.writeElement();
    } else {
      return (
        <div className="attribute-value">
          {this.readElement()}
        </div>
      );
    }
  }
}

BooleanAttribute.defaultProps = {
  ...commonDefaultProps,
  ...booleanDefaultProps,
}

BooleanAttribute.propTypes = {
  ...commonPropTypes,
  ...booleanPropTypes,
};

export default BooleanAttribute;
