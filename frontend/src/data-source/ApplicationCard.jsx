import React from 'react';
import PropTypes from 'prop-types';

import './ApplicationCard.css';
import { Tag } from "antd";

class ApplicationCard extends React.Component {
  render() {
    return (
      <div className="application-card">
        {this.props.application.organization_name && (
          <Tag>
            {this.props.application.organization_name}
          </Tag>
        )}
        <div className="application-card-label">
          Application
        </div>
        <h3>
          {this.props.application.name}
        </h3>
        <p className="application-card-description">
          {this.props.application.goals}
        </p>
      </div>
    );
  }
}

ApplicationCard.propTypes = {
  application: PropTypes.object,
};

export default ApplicationCard;
