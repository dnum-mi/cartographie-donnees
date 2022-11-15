import React from 'react';
import {withRouter} from 'react-router-dom';
import "./KpiPage.css";
import {Table} from "antd";

class RoutingKpiTab extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        const datasource_columns = [
            {
                title: 'Fiche donnée',
                dataIndex: 'subpath',
                key: 'datasource_kpi_id',
            },
            {
                title: 'Nombre de visites',
                dataIndex: 'count',
                key: 'datasource_kpi_count',
            },
        ]

        const path_columns = [
            {
                title: 'Type de page',
                dataIndex: 'pathname',
                key: 'path_kpi_type',
            },
            {
                title: 'Nombre de visites',
                dataIndex: 'count',
                key: 'path_kpi_count',
            },
        ]

        return (
            <div>
                <Table dataSource={this.props.routing_kpi.path_count_visits || null}
                       columns={path_columns}/>
                <Table dataSource={this.props.routing_kpi.datasource_count_visits || null}
                       columns={datasource_columns}/>
            </div>
        )
    }
}

export default withRouter(RoutingKpiTab);
