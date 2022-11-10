import React from "react";
import PropTypes from "prop-types";
import { withRouter, Link } from "react-router-dom";
import { Tag, Typography } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import './DataSourceResult.css';

const { Paragraph } = Typography;

class DataSourceResult extends React.Component {
  render() {
    return (
      <div className="DataSourceResult">
        <Link to={'/data-source/' + this.props.dataSource.id}>
          <h3>
            {this.props.dataSource.name}
          </h3>
        </Link>
        <Link
          title="Ouvrir la donnée dans un nouvel onglet"
          className="newTab"
          to={'/data-source/' + this.props.dataSource.id}
          target="_blank"
          rel="noopener noreferrer">
          <ExportOutlined/>
        </Link>
        <Paragraph className="paragraph">
          <span className="attribute-label">Description :</span>
          <span className="attribute-value">{this.props.dataSource.description}</span>
        </Paragraph>
        <Paragraph className="paragraph">
          <span className="attribute-label">Finalités de l'application :</span>
          <span className="attribute-value">{this.props.dataSource.application.goals}</span>
        </Paragraph>

        <div className="attributes">
          {this.props.dataSource.application ? (
            <Tag
              className="onHover"
              onClick={() => this.props.onFilterSelect("selectedApplication", this.props.dataSource.application.name)}
              color="magenta"
              title={this.props.dataSource.application.long_name}
            >
              {this.props.dataSource.application.name}
            </Tag>
          ) : null}
          {this.props.dataSource.application ? (
            <Tag
              className="onHover"
              onClick={() => this.props.onFilterSelect("selectedOrganization", this.props.dataSource.application.organization_name)}
              color="volcano"
              title={this.props.dataSource.application.organization_long_name}
            >
              {this.props.dataSource.application.organization_name}
            </Tag>
          ) : null}
          {this.props.dataSource.family_name.map((tag) => (
            <Tag
              key={tag}
              className="onHover"
              onClick={() => this.props.onFilterSelect("selectedFamily", tag)}
              color="blue"
            >
              {tag}
            </Tag>
          ))}
          <Tag
            className="onHover"
            onClick={() => this.props.onFilterSelect("selectedType", this.props.dataSource.type_name)}
            color="red"
          >
            {this.props.dataSource.type_name}
          </Tag>
        </div>
        <div className="attributes-two">
          {this.props.dataSource.referentiel_name.map((tag) => (
            <Tag
              key={tag}
              className="onHover"
              onClick={() => this.props.onFilterSelect("selectedReferentiel", tag)}
              color="orange"
            >
              {tag}
            </Tag>
          ))}
          {this.props.dataSource.sensibility_name ? (
            <Tag
              className="onHover"
              onClick={() => this.props.onFilterSelect("selectedSensibility", this.props.dataSource.sensibility_name)}
              color="lime"
            >
              {this.props.dataSource.sensibility_name}
            </Tag>
          ) : null}
          {this.props.dataSource.open_data_name ? (
            <Tag
              className="onHover"
              onClick={() => this.props.onFilterSelect("selectedOpenData", this.props.dataSource.open_data_name)}
              color="green"
            >
              {this.props.dataSource.open_data_name}
            </Tag>
          ) : null}
          {this.props.dataSource.exposition_name.map((exposition) => (
            <Tag
              key={exposition}
              className="onHover"
              color="gold"
              onClick={() => this.props.onFilterSelect("selectedExposition", exposition)}
            >
              {exposition}
            </Tag>
          ))}
          {this.props.dataSource.origin_name ? ((
            <Tag
              className="onHover"
              onClick={() => this.props.onFilterSelect("selectedOrigin", this.props.dataSource.origin_name)}
              color="geekblue">
              {this.props.dataSource.origin_name}
            </Tag>
          )) : null}
          {this.props.dataSource.classification_name.map((tag) => (
            <Tag
              key={tag}
              className="onHover"
              onClick={() => this.props.onFilterSelect("selectedClassification", tag)}
              color="purple"
            >
              {tag}
            </Tag>
          ))}
          {this.props.dataSource.tag_name.map((tag) => (
            <Tag
              key={tag}
              className="onHover"
              onClick={() => this.props.onFilterSelect("selectedTag", tag)}
            >
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    );
  }
}

DataSourceResult.defaultProps = {
  onFilterSelect: () => {},
}

DataSourceResult.propTypes = {
  dataSource: PropTypes.object.isRequired,
  onFilterSelect: PropTypes.func,
}

export default withRouter(DataSourceResult);
