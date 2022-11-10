import React from 'react';

import PropTypes from 'prop-types';

import './DataSourceReutilizationsSection.css';
import ApplicationCard from "./ApplicationCard";
import ApplicationSelect from "./ApplicationSelect";

class DataSourceReutilizationsSection extends React.Component {

  readComponent = () => {
    if (this.props.dataSource.reutilizations.length) {
      return (
        <>
          {this.props.dataSource.reutilizations
            .map((application) => (
              <ApplicationCard
                application={application}
                key={application.id}
              />
              ))}
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
      <ApplicationSelect
        value={this.props.dataSource.reutilizations}
        onChange={(reutilizations) => this.props.onChange(reutilizations)}
        mode={"multiple"}
        limited={false}
      />
    );
  }

  description = () => {
    const reutilizationCount = this.props.dataSource.reutilizations.length
    let result = 'Liste des '
    if (reutilizationCount > 1) {
      result += `${reutilizationCount} `;
    }
    result += `applications réutilisant cette donnée.`
    return result
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
              {this.description()}
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
