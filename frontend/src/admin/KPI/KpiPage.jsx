import React from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Modal, Skeleton, Table, Tabs} from "antd";
import {deleteYearBrowsingKPI, fetchCountKPI, fetchRoutingKPI, fetchSearchingKPI} from "../../api";
import "./KpiPage.css";
import tabs_definition from "./kpi_tabs_definition";
import {ExclamationCircleOutlined} from "@ant-design/icons";

const {confirm} = Modal;

class KpiPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            start_date: null,
            end_date: null,
            kpis: {},
            count_kpi: 0,
        }
    }


    async componentDidMount() {
        //Init dates
        const end_date = new Date().toISOString()
        let start_date = new Date()
        start_date.setFullYear(start_date.getFullYear() - 1)
        start_date = start_date.toISOString()
        this.setState({
            start_date,
            end_date
        })
        this.fetchKpis(start_date, end_date)
    }

    fetchKpis = (start_date, end_date) => {
        this.setState({loading: true})

        //Fetch KPIs
        Promise.all([
            fetchRoutingKPI(start_date, end_date),
            fetchSearchingKPI(start_date, end_date),
            fetchCountKPI()
        ]).then(([routing_kpi_res, searching_kpi_res, count_kpi_res]) => {
            const kpis = {...routing_kpi_res.data, ...searching_kpi_res.data}
            this.setState({
                kpis,
                count_kpi: count_kpi_res.data.count,
                loading: false
            })
        })
    }

    getTabs = () => {
        return tabs_definition.map((tabDef) => {
            return (
                <Tabs.TabPane tab={tabDef.label} key={tabDef.id + "_key"}>
                    <Table dataSource={this.state.kpis[tabDef.id] || null}
                           columns={tabDef.columns}
                           rowKey={tabDef.rowKey}/>
                </Tabs.TabPane>
            )
        })
    }

    onDeleteYear = () => {
        let deletion_date = new Date()
        deletion_date.setFullYear(deletion_date.getFullYear() - 1)

        return confirm({
            title: `Suppression des données de navigation datant d'avant le ${deletion_date.toLocaleDateString()}`,
            icon: <ExclamationCircleOutlined/>,
            content: `Vous êtes sur le point de supprimer les données de navigation de l'outil 
                        datant d'avant le ${deletion_date.toLocaleDateString()}. 
                        Cette action est irréversible !`,
            okType: "danger",
            onOk: () => {
                this.setState({
                    loading: true,
                    error: null,
                });
                deleteYearBrowsingKPI()
                    .then((r) => {
                            this.fetchKpis(this.state.start_date, this.state.end_date)
                        }
                    )
                    .catch((error) => {
                        console.log(error)
                        this.setState({
                            error,
                            loading: false
                        })
                    })
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    render() {
        return (

            this.state.loading
                ? <Skeleton active/>
                : <div className="KpiPage">
                    <h1>Indicateur de performance du site</h1>
                    <div className="KpiPageHeader">
                        <div>Nombre total de lignes: {this.state.count_kpi}</div>
                        <div>
                            <Button onClick={this.onDeleteYear}>Supprimer données de plus d'1 an </Button>
                        </div>
                    </div>
                    <div className={"KpiPageBody"}>
                        <Tabs defaultActiveKey="routing-kpi">
                            {this.getTabs()}
                        </Tabs>
                    </div>
                </div>
        )
    }

}

export default withRouter(KpiPage);
