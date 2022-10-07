import React from 'react';

import { Row, Col } from 'antd';
import PropTypes from 'prop-types';

import Attribute from "../components/Attribute";
import ApplicationSection from "./ApplicationSection";
import attributes from "./attributes";

import './DataSourceMainSection.css';

class DataSourceMainSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      applicationCreationMode: !this.props.allowAppSelection && !this.props.dataSource.application.id,
      applicationEditModeChangeSimulatedLoading: false
    }
  }

  updateApplication = (application) => {
    this.props.onChange({ application })
  };

  getAttributeElement(attributeKey, fromApplication) {
    const config = fromApplication ? attributes.application[attributeKey] : attributes[attributeKey];
    const data = fromApplication ? this.props.dataSource.application : this.props.dataSource;
    const onChange = fromApplication ? this.updateApplication : this.props.onChange;
    return (
      <Attribute
        id={attributeKey}
        value={data[attributeKey]}
        suffixValue={data[config.suffixAttributeId]}
        editMode={this.props.editMode}
        noRules={this.props.noRules && !fromApplication}
        applicationIsSelected={!!this.props.dataSource.application.id}
        applicationCreationMode={this.state.applicationCreationMode}
        applicationSimulatedLoading={this.state.applicationEditModeChangeSimulatedLoading}
        {...config}
      />
    );
  }

  onApplicationCreationModeUpdate = (creationMode) => {
    this.setState({applicationCreationMode: creationMode})
  }

  onApplicationEditModeChange = () => {
    this.setState({applicationEditModeChangeSimulatedLoading: true})
    setTimeout(() => {
      this.setState({applicationEditModeChangeSimulatedLoading: false})
    }, 1000);
  }

  render() {
    return (
      <div className="datasource-main-section">
        <div className="container">
          <Row gutter={16}>
            <Col span={16}>
              {this.getAttributeElement('name')}
              {this.getAttributeElement('description')}
              {this.getAttributeElement('goals', true)}
              {this.getAttributeElement('example')}
              <Row gutter={16}>
                <Col span={12}>
                  {this.getAttributeElement('family_name')}
                </Col>
                <Col span={12}>
                  {this.getAttributeElement('classification_name')}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  {this.getAttributeElement('type_name')}
                </Col>
                <Col span={12}>
                  {this.getAttributeElement('is_reference')}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  {this.getAttributeElement('origin_name')}
                </Col>
                <Col span={12}>
                  {this.getAttributeElement('origin_applications')}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  {this.getAttributeElement('open_data_name')}
                </Col>
                <Col span={12}>
                  {this.getAttributeElement('exposition_name')}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  {this.getAttributeElement('sensibility_name')}
                </Col>
                <Col span={12}>
                  {this.getAttributeElement('tag_name')}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <ApplicationSection
                allowAppSelection={this.props.allowAppSelection}
                application={this.props.dataSource.application}
                editMode={this.props.editMode}
                onChange={this.props.onChange}
                applicationCreationMode={this.state.applicationCreationMode}
                onApplicationCreationModeUpdate={this.onApplicationCreationModeUpdate}
                simulatedLoading={this.state.applicationEditModeChangeSimulatedLoading}
                onEditModeChange={this.onApplicationEditModeChange}
              />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

DataSourceMainSection.propTypes = {
  dataSource: PropTypes.object,
  editMode: PropTypes.bool,
  onChange: PropTypes.func,
};

export default DataSourceMainSection;
