import React from 'react';
import {withRouter} from 'react-router-dom';
import {Button, DatePicker, Modal, Skeleton, Table, Tabs} from "antd";
import {
    deleteYearBrowsingKPI,
    exportRoutingKPIUrl,
    exportSearchingKPIUrl,
    exportModel,
    fetchCountKPI,
    fetchRoutingKPI,
    fetchSearchingKPI
} from "../../api";
import "./KpiPage.css";
import tabs_definition from "./kpi_tabs_definition";
import {DownloadOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import moment from "moment";

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
            fetchCountKPI()
        ]).then(([routing_kpi_res, searching_kpi_res, count_kpi_res]) => {
            const kpis = {...routing_kpi_res.data, ...searching_kpi_res.data}
            this.setState({
                kpis,
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

    onExportKpis = () => {
        exportModel(exportRoutingKPIUrl, "historique_navigation.csv");
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
                    <h1>Indicateur de performance du site</h1>
                    <div className="KpiPageHeader">
                        <div>Nombre total de lignes: {this.state.count_kpi}</div>
                        <div>
                            <Button onClick={this.onDeleteYear}>Supprimer données de plus d'un an</Button>
                            <Button onClick={this.onExportKpis} icon={<DownloadOutlined/>} type="default">Export</Button>
                        </div>
                    </div>
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
        )
    }

}

export default withRouter(KpiPage);
