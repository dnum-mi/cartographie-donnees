import React from "react";
import { Input, Typography, Form } from "antd";
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
        <Form.Item name={this.props.suffixAttributeId} initialValue={this.props.suffixValue} rules={this.rules()}>
          <Input
            id={this.props.suffixAttributeId}
            type="text"
            placeholder={this.props.suffixEditionPlaceholder}
            className="attribute-input"
          />
        </Form.Item>
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
    } else if (this.props.isLink && this.props.value) {
      return (
          <a href={textValue}>{textValue}</a>
      )
    } else if (this.props.isMail && this.props.value) {
      return (
          <a href={"mailto:"+textValue}>{textValue}</a>
      )
    }
    return (
      <div style={{"whiteSpace": "pre-line", "wordBreak": "break-all"}}>
        {textValue}
        {this.props.suffixValue ? this.suffixElement() : null}
      </div>
    )
  }

  rules = () => {
    if (this.props.noRules) {
      return undefined
    }
    if (this.props.isLink) {
      return [{
        required: !!this.props.required,
        type: "url"
      }]
    } else if (this.props.isMail) {
      return [{
        required: !!this.props.required,
        type: "email"
      }]
    } else {
      return [{
        required: !!this.props.required,
      }]
    }
  }

  writeElement() {
    let input;
    if (this.props.isTextArea) {
      input = (
        <TextArea
          id={this.props.attributeId}
          placeholder={this.props.editionPlaceholder}
          className={this.attributeInputClassName()}
        />
      );
    } else {
      input = (
        <Input
          id={this.props.attributeId}
          type={this.props.inputType}
          placeholder={this.props.editionPlaceholder}
          className={this.attributeInputClassName()}
        />
      );
    }
    return (
      <div className="attribute-input-container">
        <Form.Item name={this.props.attributeId} initialValue={this.props.value} rules={this.rules()}>
          {input}
        </Form.Item>
        {this.props.hasSuffixValue ? this.suffixInput() : null}
      </div>
    )
  }

  render() {
    if (this.props.editMode && !this.props.readOnly) {
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
