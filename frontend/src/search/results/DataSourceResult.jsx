import React from "react";
import PropTypes from "prop-types";
import {withRouter, Link} from "react-router-dom";
import {Checkbox, Tag, Typography} from 'antd';
import {ExportOutlined} from '@ant-design/icons';
import './DataSourceResult.css';
import withTooltips from "../../hoc/tooltips/withTooltips";

const {Paragraph} = Typography;

class DataSourceResult extends React.Component {

    onChecked = (e) => {
        this.props.onCheckDatasource(this.props.dataSource.id, e.target.checked)
    }

    render() {
        const {tooltips} = this.props;
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
                        {this.props.dataSource.family_name.map((tag) => (
                            <Tag
                                key={tag}
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedFamily", tag)}
                                color="blue"
                                title={tooltips.get('family_name')}
                            >
                                {tag}
                            </Tag>
                        ))}
                        <Tag
                            className="onHover"
                            onClick={() => this.props.onFilterSelect("selectedType", this.props.dataSource.type_name)}
                            color="red"
                            title={tooltips.get('type_name')}
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
                                title={tooltips.get('referentiel_name')}
                            >
                                {tag}
                            </Tag>
                        ))}
                        {this.props.dataSource.sensibility_name ? (
                            <Tag
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedSensibility", this.props.dataSource.sensibility_name)}
                                color="lime"
                                title={tooltips.get('sensibility_name')}
                            >
                                {this.props.dataSource.sensibility_name}
                            </Tag>
                        ) : null}
                        {this.props.dataSource.open_data_name ? (
                            <Tag
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedOpenData", this.props.dataSource.open_data_name)}
                                color="green"
                                title={tooltips.get('open_data_name')}
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
                                title={tooltips.get('exposition_name')}
                            >
                                {exposition}
                            </Tag>
                        ))}
                        {this.props.dataSource.origin_name ? ((
                            <Tag
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedOrigin", this.props.dataSource.origin_name)}
                                color="geekblue"
                                title={tooltips.get('origin_name')}
                            >
                                {this.props.dataSource.origin_name}
                            </Tag>
                        )) : null}
                        {this.props.dataSource.analysis_axis_name.map((tag) => (
                            <Tag
                                key={tag}
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedAnalysisAxis", tag)}
                                color="purple"
                                title={tooltips.get('analysis_axis_name')}
                            >
                                {tag}
                            </Tag>
                        ))}
                        {this.props.dataSource.tag_name.map((tag) => (
                            <Tag
                                key={tag}
                                className="onHover"
                                onClick={() => this.props.onFilterSelect("selectedTag", tag)}
                                title={tooltips.get('tag_name')}
                            >
                                {tag}
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

export default withRouter(withTooltips(DataSourceResult));
