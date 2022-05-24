import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Button } from "antd";

import './DataSourceAdminHeader.css';


class DataSourceAdminHeader extends React.Component {
  readModeRow() {
    return (
      <Row>
        <Col className="datasource-admin-header-link">
          <Button type="link" onClick={() => this.props.onEditToggle(true)}>
            Modifier la fiche
          </Button>
        </Col>
        <Col className="datasource-admin-header-link">
          <Button type="link" danger>
            Supprimer la fiche
          </Button>
        </Col>
      </Row>
    )
  }

  editModeRow() {
    return (
      <Row>
        <Col className="datasource-admin-header-link">
          <Button type="link" onClick={() => this.props.onEditToggle(false)}>
            Valider la modification
          </Button>
        </Col>
        <Col className="datasource-admin-header-link">
          <Button type="link" onClick={() => this.props.onEditToggle(false)} danger>
            Annuler la modification
          </Button>
        </Col>
      </Row>
    )
  }

  render() {
    return (
      <div className="datasource-admin-header">
        <div className="container">
          {this.props.editMode ? this.editModeRow() : this.readModeRow()}
        </div>
      </div>
    );
  }
}

DataSourceAdminHeader.propTypes = {
  editMode: PropTypes.bool,
  onEditToggle: PropTypes.func,
};

export default DataSourceAdminHeader;
