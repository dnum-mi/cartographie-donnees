import React from "react";
import {applicationPropTypes, commonPropTypes} from "./attributePropTypes";
import { commonDefaultProps } from "./attributeDefaultProps";
import ApplicationSearchSelect from "../ApplicationSearchSelect";
import {Form} from 'antd'
import ApplicationSearchTag from "../ApplicationSearchTag";

class ApplicationAttribute extends React.Component {

  readElement() {
    const originApplications = this.props.value;

    if ( originApplications && originApplications.length > 0 ){
      let returnStr = this.props.value[0].name;
      if ( originApplications.length > 1 ) {
        for (let i = 1; i < originApplications.length; i++) {
          returnStr += ", " + originApplications[i].name;
        }
      }
      return returnStr;
    }
    return '-'
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
          {this.props.applicationMode === 'multiple'
          ?
              <ApplicationSearchTag
                  limited={false}
                  onChange={this.props.onChange}
                  value={this.props.value}
              />
          :
              <ApplicationSearchSelect
                  limited={false}
                  onChange={this.props.onChange}
                  value={this.props.value}
                  allowClear
              />
          }
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
  ...applicationPropTypes,
};

export default ApplicationAttribute;
