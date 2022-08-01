import React from "react";
import { Checkbox, Form } from "antd";
import { commonPropTypes, booleanPropTypes} from "./attributePropTypes";
import { commonDefaultProps, booleanDefaultProps } from "./attributeDefaultProps";


class BooleanAttribute extends React.Component {

  readElement() {
    if(this.props.value === undefined || this.props.value === null) {
      return "-"
    }
    return this.props.value ? 'Oui' : 'Non';
  }

  rules = () => {
    if (this.props.noRules) {
      return undefined
    } else {
      return [{
        required: this.props.required
      }]
    }
  }

  onChange = (e) => {
    return this.props.onChange(e.target.checked)
  }

  writeElement() {
    return (
      <div className="attribute-input-container">
        <Form.Item name={this.props.attributeId} initialValue={this.props.value} rules={this.rules()} valuePropName="checked">
          <Checkbox
            id={this.props.attributeId}
            className="attribute-input"
          />
        </Form.Item>
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
