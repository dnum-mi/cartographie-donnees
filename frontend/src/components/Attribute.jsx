import React from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

import './Attribute.css';
import TextAttribute from './attributes/TextAttribute';
import BooleanAttribute from './attributes/BooleanAttribute';
import TagAttribute from './attributes/TagAttribute';
import {
  booleanDefaultProps,
  commonDefaultProps,
  tagDefaultProps,
  textDefaultProps
} from "./attributes/attributeDefaultProps";
import {booleanPropTypes, commonPropTypes, tagPropTypes, textPropTypes} from "./attributes/attributePropTypes";


class Attribute extends React.Component {

  attributeValue() {
    switch (this.props.type) {
      case 'text':
        return <TextAttribute {...this.props} />
      case 'boolean':
        return <BooleanAttribute {...this.props} />
      case 'tag':
        return <TagAttribute {...this.props} />
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
          <QuestionCircleOutlined
            className="attribute-tooltip"
            title={this.props.tooltip}
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

export default Attribute;
