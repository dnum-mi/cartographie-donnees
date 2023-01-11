import React from "react";
import PropTypes from "prop-types";
import {withRouter, Link} from "react-router-dom";
import {Checkbox, Tag, Typography} from 'antd';
import {ExportOutlined} from '@ant-design/icons';
import './DataSourceResult.css';

const {Paragraph} = Typography;

class DataSourceResult extends React.Component {

    onChecked = (e) => {
        this.props.onCheckDatasource(this.props.dataSource.id, e.target.checked)
    }

    render() {
        return (
            <div className={"DataSourceResultContainer"}>
                {this.props.checkable && <Checkbox checked={this.props.checked} onChange={this.onChecked}></Checkbox>}
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
                        {this.props.dataSource.families.map((family) => (
                            <Tag
                                key={family.full_path}
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedFamily", family.full_path)}
                                color="blue"
                                title={family.label}
                            >
                                {family.full_path}
                            </Tag>
                        ))}
                        <Tag
                            className="onHover"
                            onClick={() => this.props.onFilterSelect("selectedType", this.props.dataSource.type.value)}
                            color="red"
                            title={this.props.dataSource.type.label}
                        >
                            {this.props.dataSource.type.value}
                        </Tag>
                    </div>
                    <div className="attributes-two">
                        {this.props.dataSource.referentiel.map((referentiel) => (
                            <Tag
                                key={referentiel.value}
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedReferentiel", referentiel.value)}
                                color="orange"
                                title={referentiel.label}
                            >
                                {referentiel.value}
                            </Tag>
                        ))}
                        {this.props.dataSource.sensibility ? (
                            <Tag
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedSensibility", this.props.dataSource.sensibility.value)}
                                color="lime"
                                title={this.props.dataSource.sensibility.label}
                            >
                                {this.props.dataSource.sensibility.value}
                            </Tag>
                        ) : null}
                        {this.props.dataSource.open_data_name ? (
                            <Tag
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedOpenData", this.props.dataSource.open_data.value)}
                                color="green"
                                title={this.props.dataSource.open_data.label}
                            >
                                {this.props.dataSource.open_data.value}
                            </Tag>
                        ) : null}
                        {this.props.dataSource.exposition.map((exposition) => (
                            <Tag
                                key={exposition.value}
                                className="onHover"
                                color="gold"
                                onClick={() => this.props.onFilterSelect("selectedExposition", exposition.value)}
                                title={exposition.label}
                            >
                                {exposition.value}
                            </Tag>
                        ))}
                        {this.props.dataSource.origin ? ((
                            <Tag
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedOrigin", this.props.dataSource.origin.value)}
                                color="geekblue"
                                title={this.props.dataSource.origin.label}>

                                {this.props.dataSource.origin.value}
                            </Tag>
                        )) : null}
                        {this.props.dataSource.analysis_axis.map((analysis_axis) => (
                            <Tag
                                key={analysis_axis.value}
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedAnalysisAxis", analysis_axis.value)}
                                color="purple"
                                title={analysis_axis.label}
                            >
                                {analysis_axis.value}
                            </Tag>
                        ))}
                        {this.props.dataSource.tags.map((tag) => (
                            <Tag
                                key={tag.value}
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedTag", tag.value)}
                                title={tag.label}
                            >
                                {tag.value}
                            </Tag>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

DataSourceResult.defaultProps = {
    onFilterSelect: () => {
    },
}

DataSourceResult.propTypes = {
    dataSource: PropTypes.object.isRequired,
    onFilterSelect: PropTypes.func,
    checkable: PropTypes.bool,
    onCheckDatasource: PropTypes.func,
    checked:PropTypes.bool
}

export default withRouter(DataSourceResult);
