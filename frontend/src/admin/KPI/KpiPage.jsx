import React from 'react';
import {withRouter} from 'react-router-dom';
import {Button, DatePicker, Divider, Modal, Skeleton, Space, Table, Tabs} from "antd";
import {
    deleteYearBrowsingKPI,
    exportModel,
    exportRoutingKPIUrl,
    exportSearchingKPIUrl,
    fetchAdminKPI,
    fetchCountKPI,
    fetchRoutingKPI,
    fetchSearchingKPI
} from "../../api";
import "./KpiPage.css";
import tabs_definition from "./kpi_definition";
import {DownloadOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import moment from "moment";
import AdminKpi from "./AdminKpi";

const {confirm} = Modal;
const {RangePicker} = DatePicker;

class KpiPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            loading_table: false,
            error: null,
            start_date: null,
            end_date: null,
            kpis: {},
            count_kpi: 0,
            date_changed: false
        }
    }

    setStatePromise = (newState) => new Promise((resolve) => this.setState(newState, () => resolve(newState)))

    async componentDidMount() {
        //Init dates
        const end_date = new Date().toISOString()
        let start_date = new Date()
        start_date.setFullYear(start_date.getFullYear() - 1)
        start_date = start_date.toISOString()

        this.setStatePromise({
            start_date,
            end_date
        })
            .then(() => this.fetchKpis())
            .then(() => this.setState({loading: false}))
    }

    fetchKpis = () => {
        //Fetch KPIs
        return Promise.all([
            fetchRoutingKPI(this.state.start_date, this.state.end_date),
            fetchSearchingKPI(this.state.start_date, this.state.end_date),
            fetchCountKPI(),
            fetchAdminKPI()
        ]).then(([routing_kpi_res, searching_kpi_res, count_kpi_res, admin_kpi_res]) => {
            const kpis = {...routing_kpi_res.data, ...searching_kpi_res.data}
            this.setState({
                kpis,
                admin_kpi: admin_kpi_res.data,
                count_kpi: count_kpi_res.data.count,
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
            title: `Suppression des données de navigation`,
            icon: <ExclamationCircleOutlined/>,
            content: `Vous êtes sur le point de supprimer les données de navigation 
                        vieilles de plus d'un an (${deletion_date.toLocaleDateString()}). 
                        Cette action est irréversible !`,
            okType: "danger",
            onOk: () => {
                this.setStatePromise({
                    loading: true,
                    error: null,
                })
                    .then(() => deleteYearBrowsingKPI())
                    .then((r) => this.fetchKpis())
                    .then(() => this.setState({loading: false}))
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

    onExportNavigationKpis = () => {
        exportModel(exportRoutingKPIUrl, "historique_navigation.csv");
    }

    onExportSearchKpis = () => {
        exportModel(exportSearchingKPIUrl, "historique_recherche.csv");
    }

    onDateChange = (dates, dateStrings) => {
        this.setState({
            start_date: dates[0].toISOString(),
            end_date: dates[1].toISOString(),
            date_changed: true
        })
    }

    onPickerClosed = (open) => {
        if (!open && this.state.date_changed) {
            this.setStatePromise({
                loading_table: true,
            })
                .then(() => this.fetchKpis())
                .then(() => this.setState({loading_table: false, date_changed: false}))

        }
    }

    render() {
        return (

            this.state.loading
                ? <Skeleton active/>
                : <div className="KpiPage">
                    <h1>Indicateurs de l'outil</h1>
                    <div className={"KpiSection"}>
                        <AdminKpi admin_kpi = {this.state.admin_kpi} application_count={this.props.application_count}/>
                    </div>

                    <div className={"KpiSection"}>
                        <h3>Indicateurs de fréquentation</h3>
                        <div className="KpiPageHeader">
                            <div>Nombre total de lignes: {this.state.count_kpi}</div>
                            <Space size={"small"} wrap>
                                <Button onClick={this.onDeleteYear}>Supprimer données de plus d'un an</Button>
                                <Button onClick={this.onExportNavigationKpis} icon={<DownloadOutlined/>}
                                        type="default">Historique navigation
                                </Button>
                                <Button onClick={this.onExportSearchKpis} icon={<DownloadOutlined/>}
                                        type="default">Historique recherche
                                </Button>
                            </Space>
                        </div>
                        <Divider/>
                        <div className={"KpiPageBody"}>
                            <RangePicker className={"DatePicker"}
                                         value={[moment(this.state.start_date), moment(this.state.end_date)]}
                                         onChange={this.onDateChange}
                                         onOpenChange={this.onPickerClosed}
                                         allowClear={false}/>
                            {!this.state.loading_table
                                ? <Tabs defaultActiveKey="routing-kpi">
                                    {this.getTabs()}
                                </Tabs>
                                : <Skeleton active/>}
                        </div>
                    </div>
                </div>
        )
    }

}

export default withRouter(KpiPage);
