import React from 'react';
import {withRouter} from 'react-router-dom';
import "./KpiPage.css";
import {Table} from "antd";

class SearchingKpiTab extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }


    render() {
        const filters_columns = [
            {
                title: 'Filtre',
                dataIndex: 0,
                key: 'filters_kpi_id',
            },
            {
                title: 'Nombre de recherches',
                dataIndex: 1,
                key: 'filters_kpi_count',
            },
        ]

        const text_columns = [
            {
                title: 'Terme de recherche',
                dataIndex: 0,
                key: 'text_kpi_id',
            },
            {
                title: 'Nombre de recherches',
                dataIndex: 1,
                key: 'text_kpi_count',
            },
        ]

        return (
            <div>
                <Table dataSource={this.props.searching_kpi.filters_queries || null}
                       columns={filters_columns}/>
                <Table dataSource={this.props.searching_kpi.text_queries || null}
                       columns={text_columns}/>
            </div>
        )
    }
}

export default withRouter(SearchingKpiTab);
