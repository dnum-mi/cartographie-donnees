import React from "react";
import { Tag, Form } from "antd";
import { commonPropTypes, tagPropTypes } from "./attributePropTypes";
import { commonDefaultProps, tagDefaultProps } from "./attributeDefaultProps";
import EnumSelect from "../EnumSelect";


class TagAttribute extends React.Component {

  readElement() {
    const {value, tagMode, tagColor, title, tagDisplayMode} = this.props;
    if (!value || !value.length) {
      return '-'
    }
    if (tagMode === 'multiple') {
      if (tagDisplayMode === 'text') {
        let returnStr = value[0];
        if (value.length > 1) {
          for (let i = 1; i < value.length; i++) {
            returnStr += ", " + value[i];
          }
        }
        return returnStr;
      }
      return (
        <>
          {value.map((value) => (
              <Tag key={value} color={tagColor} style={{ marginBottom: 8 }}
                   title={title}>
                {value}
              </Tag>
          ))}
        </>
      );
    }
    else {
      if (tagDisplayMode === 'text') {
        return value;
      }
      return (
          <Tag color={tagColor}
               title={title}>
            {value}
          </Tag>
      )
    }

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
          <EnumSelect
            category={this.props.tagCategory}
            mode={this.props.tagMode === 'multiple' ? 'multiple' : null}
            onChange={this.props.onChange}
            value={this.props.value}
          />
        </Form.Item>
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

TagAttribute.defaultProps = {
  ...commonDefaultProps,
  ...tagDefaultProps,
}

TagAttribute.propTypes = {
  ...commonPropTypes,
  ...tagPropTypes,
};

export default TagAttribute;
