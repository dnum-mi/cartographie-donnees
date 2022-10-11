import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Button, Form } from "antd";

import './DataSourceAdminHeader.css';
import withCurrentUser from "../hoc/user/withCurrentUser";


class DataSourceAdminHeader extends React.Component {
  readModeRow() {
    return (
      <Row>
        <Col className="datasource-admin-header-link">
          <Button type="link" onClick={(e) => this.props.onActivateEdition(e)}>
            Modifier la fiche
          </Button>
        </Col>
          {this.props.currentUser?.userHasAdminRightsToDatasource(this.props.dataSource) &&
          <Col className="datasource-admin-header-link">
              <Button type="link" onClick={(e) => this.props.onDuplicate(e)}>
                  Dupliquer la fiche
              </Button>
          </Col>
          }
          {this.props.currentUser?.userHasAdminRightsToDatasource(this.props.dataSource) &&
            <Col className="datasource-admin-header-link">
              <Button type="link" danger onClick={(e) => this.props.onDelete(e)}>
                Supprimer la fiche
              </Button>
            </Col>
          }
      </Row>
    )
  }

  editModeRow() {
    return (
      <Row>
        <Col className="datasource-admin-header-link">
            <Form.Item {...this.props} noStyle>
                <Button type="link" htmlType="submit">
                    {this.props.fromCreation ? "Valider la création " : "Valider la modification"}
                </Button>
            </Form.Item>
        </Col>
        {!this.props.fromCreation ? (
        <Col className="datasource-admin-header-link">
          <Button type="link" onClick={(e) => this.props.onCancelEdition(e)} danger>
            Annuler la modification
          </Button>
        </Col>
        ): undefined}
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
  onActivateEdition: PropTypes.func,
  onCancelEdition: PropTypes.func,
};

export default withCurrentUser(DataSourceAdminHeader);
