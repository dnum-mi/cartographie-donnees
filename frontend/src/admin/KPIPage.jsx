import React from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Modal, Skeleton} from "antd";
import {fetchRoutingKPI, fetchSearchingKPI} from "../api";
const {confirm} = Modal;

class KPIPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true, error: null,
        }
    }

    componentDidMount() {
        const options = {year: "numeric", month: "numeric", day: "numeric"};
        const end_date = new Date().toISOString()
        let start_date = new Date()
        start_date.setFullYear(start_date.getFullYear() - 1)
        start_date = start_date.toISOString()
        console.log(start_date, end_date)

        fetchRoutingKPI(start_date, end_date)
        fetchSearchingKPI(start_date, end_date)
    }


    render() {
        return (
            this.state.loading
                ? <Skeleton active/>
                : <div>
                    <p>Nombre total de lignes</p>
                    <Button danger>Supprimer données vieilles de 1 an </Button>
                    <Button danger>Supprimer toutes les données</Button>
                </div>
        )
    }
}

export default withRouter(KPIPage);
