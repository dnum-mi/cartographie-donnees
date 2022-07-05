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

  writeElement() {
    return (
      <div className="attribute-input-container">
        <Form.Item name={this.props.label} initialValue={this.props.value} rules={[{
          required: this.props.required
        }]}>
          <ApplicationSearchSelect
            limited={false}
            onChange={this.props.onChange}
            defaultValue={this.props.value}
            value={this.props.value}
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
