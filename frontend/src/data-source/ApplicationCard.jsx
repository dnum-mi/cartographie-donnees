import React from 'react';
import PropTypes from 'prop-types';

import './ApplicationCard.css';
import { Tag, Card } from "antd";
import {withRouter} from "react-router-dom";

class ApplicationCard extends React.Component {
  handleClick = () => {
      this.props.history.push("/application/"+this.props.application.id)
  }

  render() {
    return (
      <Card hoverable onClick={this.handleClick} title={this.props.application.name}>
        {this.props.application.organization_name && (
          <p>
              <Tag>
                  {this.props.application.organization_name}
              </Tag>
          </p>
        )}
        <p className="application-card-description">
          {this.props.application.goals}
        </p>
      </Card>
    );
  }
}

ApplicationCard.propTypes = {
  application: PropTypes.object,
};

export default withRouter(ApplicationCard);
