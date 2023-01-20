import React from "react";
import PropTypes from "prop-types";
import {withRouter, Link} from "react-router-dom";
import {Divider, Tag} from 'antd';
import {ExportOutlined} from '@ant-design/icons';
import './DataSourceResult.css';
import withTooltips from "../../hoc/tooltips/withTooltips";

class DataSourceHighlight extends React.Component {

    formatNumber = (number) => {
        return new Intl.NumberFormat(
            'fr-FR',
            {
                maximumSignificantDigits: 3,
                useGrouping: true
            }).format(number)
    }


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
                <div className="attributes-two">
                    {this.props.dataSource.application ? (<Tag
                        className="onHover"
                        onClick={() => this.props.onFilterSelect("selectedOrganization", this.props.dataSource.application.organization_name)}
                        color="volcano"
                        title={this.props.dataSource.application.organization_long_name}
                    >
                        {this.props.dataSource.application.organization_name}
                    </Tag>) : null}
                    {this.props.dataSource.family_name.map((tag) => (<Tag
                        key={tag}
                        className="onHover"
                        onClick={() => this.props.onFilterSelect("selectedFamily", tag)}
                        color="blue"
                        title={this.props.tooltips.get("family_name")}
                    >
                        {tag}
                    </Tag>))}
                </div>
                <div className="DataSourceHighlightKpi">
                    Utilisateurs : {this.formatNumber(this.props.dataSource.application.user_count) || " -"}
                    <Divider type={"vertical"}/>
                    Réutilisations : {this.formatNumber(this.props.dataSource.nb_reutilizations) || 0}
                </div>
            </div>
        );
    }
}

DataSourceHighlight.defaultProps = {
    onFilterSelect: () => {
    },
}

DataSourceHighlight.propTypes = {
    dataSource: PropTypes.object.isRequired,
    onFilterSelect: PropTypes.func,
}

export default withRouter(withTooltips(DataSourceHighlight));
