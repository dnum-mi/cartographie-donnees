import React from "react";
import {applicationPropTypes, commonPropTypes} from "./attributePropTypes";
import { commonDefaultProps } from "./attributeDefaultProps";
import {Form} from 'antd'
import ApplicationSelect from "../../data-source/ApplicationSelect";

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
          <ApplicationSelect 
            mode = {this.props.applicationMode}
            limited = {this.props.applicationLimited}
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
  ...applicationPropTypes,
};

export default ApplicationAttribute;
