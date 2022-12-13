import React from 'react';
import {withRouter} from 'react-router-dom';
import "./KpiPage.css";
import {admin_kpi_definition} from "./kpi_definition";

class AdminKpi extends React.Component {

    constructor(props) {
        super(props);
    }

    formatNumber = (number) => {
        return new Intl.NumberFormat(
            'fr-FR',
            {
                useGrouping: true
            }).format(number)
    }

    renderAdminKpi = (config) => {
        return <p>
            {config.label}:
            <strong>
                {config.is_percent
                    ? this.props.admin_kpi[config.key]*100 + "%"
                    : this.formatNumber(this.props.admin_kpi[config.key])}
                {
                    config.show_app_percent &&
                    " (" +
                    this.formatNumber(
                        Math.round(this.props.admin_kpi[config.key] * 100 / this.props.application_count))
                    + "%)"
                }
            </strong>
        </p>
    }

    render() {
        return <div className={"AdminKpi"}>
            <h3>Indicateurs pour l'administration</h3>
            {
                admin_kpi_definition.map((config) => {
                        return <div>
                            <h4>{config.title}</h4>
                            {config.children.map(config => this.renderAdminKpi(config))}
                        </div>
                    }
                )

            }
        </div>
    }
}

export default withRouter(AdminKpi);
