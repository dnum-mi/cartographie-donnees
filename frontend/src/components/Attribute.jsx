import React from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";

import './Attribute.css';
import TextAttribute from './attributes/TextAttribute';
import BooleanAttribute from './attributes/BooleanAttribute';
import TagAttribute from './attributes/TagAttribute';
import { commonDefaultProps } from "./attributes/attributeDefaultProps";
import { commonPropTypes } from "./attributes/attributePropTypes";
import ApplicationAttribute from "./attributes/ApplicationAttribute";
import withTooltips from "../hoc/tooltips/withTooltips";
import DateAttribute from "./attributes/DateAttribute";

class Attribute extends React.Component {

  attributeValue() {
    switch (this.props.type) {
      case 'text':
        return <TextAttribute {...this.props} />
      case 'boolean':
        return <BooleanAttribute {...this.props} />
      case 'tag':
        return <TagAttribute {...this.props} />
      case 'application':
        return <ApplicationAttribute {...this.props} />
      case 'date':
        return <DateAttribute {...this.props} />
      default:
        return null;
    }
  }

  render() {
    return (
      <div className="attribute">
        <label
          htmlFor={this.props.attributeId}
          className="attribute-label"
        >
          {this.props.label}
          {this.props.required ? "*" : undefined}
          <QuestionCircleOutlined
            className="attribute-tooltip"
            title={this.props.tooltips.get(this.props.attributeId)}
          />
        </label>
        {this.attributeValue()}
      </div>
    );
  }
}

Attribute.defaultProps = {
  ...commonDefaultProps,
}

Attribute.propTypes = {
  ...commonPropTypes,
};

export default withTooltips(Attribute);
