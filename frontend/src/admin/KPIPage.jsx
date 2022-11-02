import React from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Modal, Skeleton} from "antd";

const {confirm} = Modal;

class KPIPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true, error: null,
        }
    }

    componentDidMount() {
/*
        fetchKPI()
        see SQL LIKE %what we're looking for"%
        % -> n'importe quel caractère
        fetchLineCount()
*/
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
