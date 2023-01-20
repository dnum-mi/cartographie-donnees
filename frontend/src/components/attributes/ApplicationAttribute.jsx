import React from "react";
import {applicationPropTypes, commonPropTypes} from "./attributePropTypes";
import { commonDefaultProps } from "./attributeDefaultProps";
import {Form} from 'antd'
import ApplicationSelect from "../../data-source/ApplicationSelect";
import {Link} from "react-router-dom";

class ApplicationAttribute extends React.Component {

  readElement() {
    const originApplications = this.props.value;

    if ( originApplications && originApplications.length > 0 ){
      return this.props.value.map(
          (app, index) => {
            return <span>{index > 0 && ', '}<Link to={'/application/' + app.id}>{app.name}</Link></span>
          }
      )
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
