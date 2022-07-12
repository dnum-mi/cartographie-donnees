import React from "react";
import { commonPropTypes } from "./attributePropTypes";
import { commonDefaultProps } from "./attributeDefaultProps";
import ApplicationSearchSelect from "../ApplicationSearchSelect";
import {Form} from 'antd'

class ApplicationAttribute extends React.Component {

  readElement() {
    if (!this.props.value) {
      return '-'
    }
    return this.props.value.name
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

  writeElement() {
    return (
      <div className="attribute-input-container">
        <Form.Item name={this.props.attributeId} initialValue={this.props.value} rules={this.rules()}>
          <ApplicationSearchSelect
            limited={false}
            onChange={this.props.onChange}
            value={this.props.value}
            allowClear
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

ApplicationAttribute.defaultProps = {
  ...commonDefaultProps,
}

ApplicationAttribute.propTypes = {
  ...commonPropTypes,
};

export default ApplicationAttribute;
