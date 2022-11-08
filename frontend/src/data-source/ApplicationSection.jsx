import React from 'react';
import PropTypes from 'prop-types';

import './ApplicationSection.css';
import Attribute from "../components/Attribute";
import attributes from "./attributes";
import ApplicationSelect from "./ApplicationSelect";
import {Link} from "react-router-dom";
import withCurrentUser from "../hoc/user/withCurrentUser";
import {QuestionCircleOutlined} from "@ant-design/icons";
import {Badge, Col, Divider, Row, Skeleton} from "antd";
import ApplicationAdd from "./ApplicationAdd";
import withTooltips from '../hoc/tooltips/withTooltips';

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
        suffixValue={this.props.application.data_source_count ? this.linkToDataSources(): null}
        editMode={this.props.editMode}
        {...config}
      />
    );
  }

  onApplicationChange = (newChoice) => {
      this.props.onChange({ application: newChoice})
  }

  renderApplicationEdit = () => {
    if(this.props.simulatedLoading) {
      return (<Skeleton active/>)
    }
    else {
      return (
        <>
          { this.props.editMode
              ? <Badge.Ribbon
                  text={this.props.applicationCreationMode ? "Création d'application" : "Modification de l'application"}
                  color={this.props.applicationCreationMode ? "green" : "blue"}>
                    {this.getAttributeElement('name')}
                </Badge.Ribbon>
              : this.getAttributeElement('name')

          }

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
  }

  onAddApplicationClick = () => {
    this.props.onEditModeChange()
    let application = this.props.application;
    Object.keys(application).forEach(attr => {
      application[attr] = null;
    })
    this.onApplicationChange(application)
    this.props.onApplicationCreationModeUpdate(true)
  }

  onApplicationSelectionChange = (change) => {
    this.props.onEditModeChange()
    this.onApplicationChange(change)
    this.props.onApplicationCreationModeUpdate(false)
  }

  render() {
    const applicationEditMode = (this.props.currentUser?.user?.is_admin && this.props.applicationCreationMode) || this.props.application.id !== null;
    return (
      <div className="application-section">
        {
          // applicationEditMode != data source editMode
          this.props.editMode && this.props.allowAppSelection ?
          (
            <div className="attribute">
              <label className="attribute-label">
                  Choix d'Application
                  <QuestionCircleOutlined
                      className="attribute-tooltip"
                      title={this.props.tooltips.get("application_select")}
                  />
                  <Row wrap={false}>
                    <Col flex="auto" style={{ marginRight: '16px' }}>
                      <ApplicationSelect onChange={this.onApplicationSelectionChange} value={this.props.application} applicationCreationMode={this.props.applicationCreationMode}/>
                    </Col>
                    {
                      this.props.currentUser?.user?.is_admin &&
                        <Col flex="30px">
                          <ApplicationAdd applicationCreationMode={this.props.applicationCreationMode} onAddApplicationClick={this.onAddApplicationClick}/>
                        </Col>
                    }

                  </Row>


              </label>
              {applicationEditMode && <Divider />}
            </div>
          ) :
          undefined
        }
        {applicationEditMode && this.renderApplicationEdit()}
      </div>
    );
  }
}

ApplicationSection.propTypes = {
  application: PropTypes.object,
  editMode: PropTypes.bool,
};

export default withCurrentUser(withTooltips(ApplicationSection));
