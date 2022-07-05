import React from 'react';

import PropTypes from 'prop-types';

import './DataSourceReutilizationsSection.css';
import ApplicationCard from "./ApplicationCard";
import ApplicationSearchTag from "../components/ApplicationSearchTag";

class DataSourceReutilizationsSection extends React.Component {

  readComponent = () => {
    if (this.props.dataSource.reutilizations.length) {
      return (
        <>
          {this.props.dataSource.reutilizations
            .map((application) => <ApplicationCard application={application} key={application.id} />)}
        </>
      );
    }
    return (
      <p className="datasource-reutilizations-no-results">
        Aucune réutilisation
      </p>
    );
  }

  writeComponent = () => {
    return (
      <ApplicationSearchTag
        limited={false}
        value={this.props.dataSource.reutilizations}
        onChange={(reutilizations) => this.props.onChange({ reutilizations })}
      />
    );
  }

  render() {
    return (
      <div className="datasource-reutilizations-section">
        <div className="container">
          <div>
            <h2>
              Réutilisations
            </h2>
            <p className="datasource-reutilizations-description">
              Liste des applications réutilisant cette donnée.
            </p>
            <div className="datasource-reutilizations-container">
              {this.props.editMode ? this.writeComponent() : this.readComponent()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

DataSourceReutilizationsSection.propTypes = {
  dataSource: PropTypes.object,
  editMode: PropTypes.bool,
  onChange: PropTypes.func,
};

export default DataSourceReutilizationsSection;
