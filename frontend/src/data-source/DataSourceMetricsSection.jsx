import React from 'react';

import { Row, Col } from 'antd';
import PropTypes from 'prop-types';

import Attribute from "../components/Attribute";
import attributes from "./attributes";

import './DataSourceMetricsSection.css';

class DataSourceMetricsSection extends React.Component {

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
      <div className="datasource-metrics-section">
        <div className="container">
          <div>
            <h2>
              Métriques
            </h2>
            <Row gutter={16}>
              <Col span={8}>
                {this.getAttributeElement('volumetry')}
                {this.getAttributeElement('monthly_volumetry')}
                {this.getAttributeElement('update_frequency_name')}
                {this.getAttributeElement('conservation')}
              </Col>
              <Col span={8}>
                {this.getAttributeElement('database_name')}
                {this.getAttributeElement('database_table_name')}
                {this.getAttributeElement('database_table_count')}
              </Col>
              <Col span={8}>
                {this.getAttributeElement('field')}
                {this.getAttributeElement('field_count')}
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

DataSourceMetricsSection.propTypes = {
  dataSource: PropTypes.object,
  editMode: PropTypes.bool,
};

export default DataSourceMetricsSection;
