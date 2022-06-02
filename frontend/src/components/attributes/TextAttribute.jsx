import React from "react";
import { Input, Typography } from "antd";
import { commonPropTypes, textPropTypes } from "./attributePropTypes";
import { commonDefaultProps, textDefaultProps } from "./attributeDefaultProps";
import {QuestionCircleOutlined} from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;


class TextAttribute extends React.Component {

  suffixElement() {
    return (
      <span className="attribute-suffix-value">
        ({this.props.suffixValue})
      </span>
    );
  }

  suffixInput() {
    return (
      <div className="attribute">
        <label
          htmlFor={this.props.suffixAttributeId}
          className="attribute-label"
        >
          {this.props.suffixAttributeLabel}
          <QuestionCircleOutlined
            className="attribute-tooltip"
            title="Commentaire sur cette valeur"
          />
        </label>
        <Input
          id={this.props.suffixAttributeId}
          defaultValue={this.props.suffixValue}
          type="text"
          placeholder={this.props.suffixEditionPlaceholder}
          className="attribute-input"
          onChange={(e) => {
            this.props.onChange(e.target.value, true)
          }}
        />
      </div>
    );
  }

  attributeInputClassName() {
    return this.props.headingLevel ?
      `attribute-input attribute-input-h${this.props.headingLevel}` :
      'attribute-input';
  }

  readElement() {
    const textValue = this.props.value || '-';
    if (this.props.headingLevel) {
      return (
        <Title level={this.props.headingLevel}>
          {textValue}
          {this.props.suffixValue ? this.suffixElement() : null}
        </Title>
      )
    }
    return (
      <>
        {textValue}
        {this.props.suffixValue ? this.suffixElement() : null}
      </>
    )
  }

  writeElement() {
    let input;
    if (this.props.isTextArea) {
      input = (
        <TextArea
          id={this.props.attributeId}
          defaultValue={this.props.value}
          placeholder={this.props.editionPlaceholder}
          className={this.attributeInputClassName()}
          onChange={(e) => this.props.onChange(e.target.value)}
        />
      );
    } else {
      input = (
        <Input
          id={this.props.attributeId}
          defaultValue={this.props.value}
          type={this.props.inputType}
          placeholder={this.props.editionPlaceholder}
          className={this.attributeInputClassName()}
          onChange={(e) => this.props.onChange(e.target.value)}
        />
      );
    }
    return (
      <div className="attribute-input-container">
        {input}
        {this.props.hasSuffixValue ? this.suffixInput() : null}
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

TextAttribute.defaultProps = {
  ...commonDefaultProps,
  ...textDefaultProps,
}

TextAttribute.propTypes = {
  ...commonPropTypes,
  ...textPropTypes,
};

export default TextAttribute;