import React from 'react';
import PropTypes from 'prop-types';

import './ApplicationSection.css';
import Attribute from "../components/Attribute";
import attributes from "./attributes";

class ApplicationSection extends React.Component {

  getAttributeElement(attributeKey) {
    const config = attributes.application[attributeKey];
    return (
      <Attribute
        value={this.props.application[attributeKey]}
        suffixValue={this.props.application[config.suffixAttributeId]}
        editMode={this.props.editMode}
        onChange={(value, fromSuffix = false) => {
          if (fromSuffix) {
            this.props.onChange({ application: {[config.suffixAttributeId]: value} })
          } else {
            this.props.onChange({ application: { [attributeKey]: value} })
          }
        }}
        {...config}
      />
    );
  }

  render() {
    return (
      <div className="application-section">
        {this.getAttributeElement('name')}
        {this.getAttributeElement('organization_name')}
        {this.getAttributeElement('context_email')}
        {this.getAttributeElement('data_source_count')}
        {this.getAttributeElement('operator_count')}
        {this.getAttributeElement('user_count')}
        {this.getAttributeElement('monthly_connection_count')}
        {this.getAttributeElement('historic')}
        {this.getAttributeElement('validation_date')}
      </div>
    );
  }
}

ApplicationSection.propTypes = {
  application: PropTypes.object,
  editMode: PropTypes.bool,
};

export default ApplicationSection;
