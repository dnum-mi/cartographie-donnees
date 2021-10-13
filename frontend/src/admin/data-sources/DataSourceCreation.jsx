import React from 'react';
import queryString from 'query-string'
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';

import DataSourceForm from './DataSourceForm';
import { createDataSource } from "../../api";
import { readApplication } from '../../api';
import Error from "../../components/Error";

import './DataSourceCreation.css';


class DataSourceCreation extends React.Component {

    constructor(props) {
        super(props);
        const application_id = queryString.parse(this.props.location.search).application;
        this.state = {
            loading: false,
            error: null,
            application_id: application_id,
        };
        if (application_id != undefined){
            this.readApplicationFromApi();
        }
    }

    readApplicationFromApi() {
        this.setState({
            loading: true,
            error: null,
        });
        readApplication(this.state.application_id, true)
            .then((response) => {
                this.setState({
                    application: response.data,
                    loading: false,
                    error: null,
                });
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error: error,
                });
            });
    }

    submitForm = (dataSource) => {
        this.setState({ loading: true });
        createDataSource(dataSource)
            .then(() => {
                this.props.count();
                this.props.history.push('/admin/data-sources');
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error,
                });
            });
    };

    render() {
        let dataSource = {}
        if (this.state.application){
            dataSource["application_name"] = this.state.application.name;
            dataSource["application"] = this.state.application;
        }
        return (
            <Spin tip="Envoi en cours..." spinning={this.state.loading}>
                <div className="DataSourceCreation">
                    <h1>
                        Création d'une donnée
                    </h1>
                    {this.state.error && <Error error={this.state.error} />}
                    <div>
                        <DataSourceForm onSubmit={this.submitForm} dataSource={dataSource}/>
                    </div>
                </div>
            </Spin>
        );
    }
}

export default withRouter(DataSourceCreation);
