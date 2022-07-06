import React from "react";
import { Tag } from "antd";
import { commonPropTypes, tagPropTypes } from "./attributePropTypes";
import { commonDefaultProps, tagDefaultProps } from "./attributeDefaultProps";
import EnumSelect from "../EnumSelect";


class TagAttribute extends React.Component {

  readElement() {
    if (!this.props.value || !this.props.value.length) {
      return '-'
    }
    if (this.props.tagMode === 'multiple') {
      return (
        <>
          {this.props.value.map((value) => (<Tag key={value} color={this.props.tagColor} style={{ marginBottom: 8 }}>{value}</Tag>))}
        </>
      );
    }
    return <Tag color={this.props.tagColor}>{this.props.value}</Tag>
  }

  writeElement() {
    return (
      <div className="attribute-input-container">
        <EnumSelect
          category={this.props.tagCategory}
          mode={this.props.tagMode === 'multiple' ? 'multiple' : null}
          onChange={this.props.onChange}
          defaultValue={this.props.value}
        />
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

TagAttribute.defaultProps = {
  ...commonDefaultProps,
  ...tagDefaultProps,
}

TagAttribute.propTypes = {
  ...commonPropTypes,
  ...tagPropTypes,
};

export default TagAttribute;
