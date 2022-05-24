import React from 'react';

import { Row, Col } from 'antd';
import PropTypes from 'prop-types';

import Attribute from "../components/Attribute";
import ApplicationSection from "./ApplicationSection";
import attributes from "./attributes";

import './DataSourceMainSection.css';

class DataSourceMainSection extends React.Component {

  getAttributeElement(attributeKey, fromApplication) {
    const config = fromApplication ? attributes.application[attributeKey] : attributes[attributeKey];
    const data = fromApplication ? this.props.dataSource.application : this.props.dataSource;
    return (
      <Attribute
        value={data[attributeKey]}
        suffixValue={data[config.suffixValueKey]}
        editMode={this.props.editMode}
        {...config}
      />
    );
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
                  {this.getAttributeElement('origin_application_name')}
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
                application={this.props.dataSource.application}
                editMode={this.props.editMode}
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
};

export default DataSourceMainSection;
