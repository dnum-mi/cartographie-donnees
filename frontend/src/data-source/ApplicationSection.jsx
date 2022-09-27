import React from 'react';
import PropTypes from 'prop-types';

import './ApplicationSection.css';
import Attribute from "../components/Attribute";
import attributes from "./attributes";
import ApplicationSelect from "./ApplicationSelect";
import {Link} from "react-router-dom";

class ApplicationSection extends React.Component {

  getAttributeElement(attributeKey, title_key=null) {
    const config = attributes.application[attributeKey];
    return (
      <Attribute
        id={attributeKey}
        value={this.props.application[attributeKey]}
        suffixValue={this.props.application[config.suffixAttributeId]}
        editMode={this.props.editMode}
        title={this.props.application[title_key]}
        {...config}
      />
    );
  }

  linkToDataSources = () => (
    <Link to={{
      pathname: "/search",
      search: "?application=" + this.props.application.name
    }}>
      Liste des données
    </Link>
  );

  getDataSourceCountElement() {
    const config = attributes.application.data_source_count;

    return (
      <Attribute
        id='data_source_count'
        value={this.props.application.data_source_count}
        suffixValue={this.linkToDataSources()}
        editMode={this.props.editMode}
        {...config}
      />
    );
  }

  onSelectChange = (newChoice) => {
      this.props.onChange({ application: newChoice})
  }

  renderApplicationEdit = () => {
    return (
        <>
          {this.getAttributeElement('name')}
          {this.getAttributeElement('long_name')}
          {this.getAttributeElement('access_url')}
          {this.getAttributeElement('organization_name', 'organization_long_name')}
          {this.getAttributeElement('context_email')}
          {this.getDataSourceCountElement()}
          {this.getAttributeElement('operator_count')}
          {this.getAttributeElement('user_count')}
          {this.getAttributeElement('monthly_connection_count')}
          {this.getAttributeElement('historic')}
          {this.getAttributeElement('validation_date')}
        </>
    )
  }

  render() {
    return (
      <div className="application-section">
        {this.props.editMode && this.props.allowAppSelection ? <ApplicationSelect onChange={this.onSelectChange} value={this.props.application}/> : undefined}
        {this.props.application.id !== null && this.renderApplicationEdit()}
      </div>
    );
  }
}

ApplicationSection.propTypes = {
  application: PropTypes.object,
  editMode: PropTypes.bool,
};

export default ApplicationSection;
