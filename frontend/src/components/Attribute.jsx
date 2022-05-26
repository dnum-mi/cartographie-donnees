import React from "react";
import PropTypes from 'prop-types';
import { QuestionCircleOutlined } from "@ant-design/icons";
import {Checkbox, Input, Tag, Typography} from 'antd';
import './Attribute.css';

const { Title } = Typography;
const { TextArea } = Input;


class Attribute extends React.Component {

  textValueElement() {
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

  valueElement() {
    switch (this.props.type) {
      case 'boolean':
        return this.props.value ? 'Oui' : 'Non';
      case 'tag':
        if (!this.props.value || !this.props.value.length) {
          return '-'
        }
        if (this.props.tagMode === 'multiple') {
          return (
            <>
              {this.props.value.map((value) => (<Tag key={value}>{value}</Tag>))}
            </>
          );
        }
        return <Tag>{this.props.value}</Tag>
      default:
        return this.textValueElement();
    }
  }

  suffixElement() {
    return (
      <span className="attribute-suffix-value">
        ({this.props.suffixValue})
      </span>
    );
  }

  attributeInputClassName() {
    return this.props.headingLevel ? `attribute-input attribute-input-h${this.props.headingLevel}` : 'attribute-input';
  }

  editionElement() {
    let input = null;
    switch (this.props.type) {
      case 'textArea':
        input = (
          <TextArea
            id={this.props.attributeId}
            defaultValue={this.props.value}
            placeholder={this.props.editionPlaceholder}
            className={this.attributeInputClassName()}
            onChange={(e) => this.props.onChange(e.target.value)}
          />
        );
        break;
      case 'boolean':
        input = (
          <Checkbox
            id={this.props.attributeId}
            defaultChecked={this.props.value}
            className={this.attributeInputClassName()}
            onChange={(e) => this.props.onChange(e.target.checked)}
          />
        );
        break;
      default:
        input = (
          <Input
            id={this.props.attributeId}
            defaultValue={this.props.value}
            type="text"
            placeholder={this.props.editionPlaceholder}
            className={this.attributeInputClassName()}
            onChange={(e) => this.props.onChange(e.target.value)}
          />
        );
    }
    return (
      <div className="attribute-input-container">
        {input}
        {this.props.hasSuffixValue ? "?" : null}
      </div>
    )
  }

  attributeValue() {
    if (this.props.editMode) {
      return this.editionElement();
    } else {
      return (
        <div className="attribute-value">
          {this.valueElement()}
        </div>
      );
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
  headingLevel: null,
  tooltip: null,
  value: null,
  suffixValue: null,
  editMode: false,
  editionPlaceholder: null,
  onChange: () => {},
}

Attribute.propTypes = {
  attributeId: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  headingLevel: PropTypes.number,
  type: PropTypes.oneOf([
    'text', 'textArea', 'boolean', 'tag'
  ]).isRequired,
  tooltip: PropTypes.string,
  value: PropTypes.any,
  hasSuffixValue: PropTypes.bool,
  suffixValue: PropTypes.string,
  tagMode: PropTypes.oneOf([
    'simple', 'multiple',
  ]),
  editMode: PropTypes.bool,
  editionPlaceholder: PropTypes.string,
  onChange: PropTypes.func,
};

export default Attribute;
