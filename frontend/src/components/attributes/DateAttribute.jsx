import React from "react";
import {Input, Typography, Form, Spin, DatePicker} from "antd";
import { commonPropTypes, textPropTypes } from "./attributePropTypes";
import { commonDefaultProps, textDefaultProps } from "./attributeDefaultProps";
import {QuestionCircleOutlined} from "@ant-design/icons";
import withCurrentUser from "../../hoc/user/withCurrentUser";
import withTooltips from "../../hoc/tooltips/withTooltips";
import moment from "moment";


const { Title } = Typography;

class DateAttribute extends React.Component {

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
            title={this.props.tooltips.get(this.props.suffixAttributeId)}
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
          <a href={textValue} target="_blank" rel="noreferrer">{textValue}</a>
      )
    } else if (this.props.isMail && this.props.value) {
      return (
          <a href={"mailto:"+textValue}>{textValue}</a>
      )
    }
    return (
      <div style={{"whiteSpace": "pre-line", "wordBreak": "normal", "overflowWrap": "anywhere"}}>
        {
          isNaN(textValue)
              ? textValue
              : new Intl.NumberFormat('fr-FR', { maximumSignificantDigits: 3 }).format(textValue)
        }
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
    const dateFormat = "DD/MM/YYYY";
    const spinning = !!this.props.textEditDisabledIfApplicationNotSelected && !!this.props.applicationSimulatedLoading
    const initialValue = this.props.value == null ? null : moment(this.props.value, dateFormat)
    return (
      <div className="attribute-input-container">
        <Spin spinning={spinning}>
          <Form.Item
            name={this.props.attributeId}
            initialValue={initialValue}
            getValueProps={(i) => ({ value: initialValue })}
          >
            <DatePicker format={dateFormat} style={{ width: '100%' }} />
          </Form.Item>
          {this.props.hasSuffixValue ? this.suffixInput() : null}
        </Spin>
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

DateAttribute.defaultProps = {
  ...commonDefaultProps,
  ...textDefaultProps,
}

DateAttribute.propTypes = {
  ...commonPropTypes,
  ...textPropTypes,
};

export default withCurrentUser(withTooltips(DateAttribute));
