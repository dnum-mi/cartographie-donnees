import React from 'react';

import PropTypes from 'prop-types';

import './DataSourceReutilizationsSection.css';
import ApplicationCard from "./ApplicationCard";

class DataSourceReutilizationsSection extends React.Component {
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
              {this.props.dataSource.reutilizations.length ? (
                this.props.dataSource.reutilizations
                  .map((application) => <ApplicationCard application={application} />)
              ) : (
                <p className="datasource-reutilizations-no-results">
                  Aucune réutilisation
                </p>
              )}
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
};

export default DataSourceReutilizationsSection;
