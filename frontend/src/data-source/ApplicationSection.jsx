import React from 'react';
import PropTypes from 'prop-types';

import './ApplicationSection.css';
import Attribute from "../components/Attribute";
import attributes from "./attributes";

class ApplicationSection extends React.Component {

  getAttributeElement(attributeId) {
    const config = attributes.application[attributeId];
    return (
      <Attribute
        value={this.props.application[attributeId]}
        suffixValue={this.props.application[config.suffixValueKey]}
        editMode={this.props.editMode}
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
        {this.getAttributeElement('data_sources_count')}
        {this.getAttributeElement('operator_count')}
        {this.getAttributeElement('user_count')}
        {this.getAttributeElement('monthly_connection_count')}
        {this.getAttributeElement('validation_date')}
        {this.getAttributeElement('historic')}
      </div>
    );
  }
}

ApplicationSection.propTypes = {
  application: PropTypes.object,
  editMode: PropTypes.bool,
};

export default ApplicationSection;
