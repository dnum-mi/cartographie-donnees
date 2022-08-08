import React from 'react';
import PropTypes from 'prop-types';

import { Tag, Card, Typography } from "antd";
import {withRouter} from "react-router-dom";

const { Paragraph } = Typography;

class ApplicationCard extends React.Component {
  handleClick = () => {
      this.props.history.push("/application/"+this.props.application.id)
  }

  render() {
    return (
      <Card
        hoverable
        onClick={this.handleClick}
        title={this.props.application.name}
      >
        {this.props.application.organization_name && (
          <p>
              <Tag title={this.props.application.organization_long_name}>
                  {this.props.application.organization_name}
              </Tag>
          </p>
        )}
        <Paragraph ellipsis={{ rows: 4 }} className="application-card-description">
          {this.props.application.goals}
        </Paragraph>
      </Card>
    );
  }
}

ApplicationCard.propTypes = {
  application: PropTypes.object,
};

export default withRouter(ApplicationCard);
