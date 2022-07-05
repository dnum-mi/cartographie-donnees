import React from 'react';
import queryString from 'query-string'
import {withRouter} from 'react-router-dom';
import {Spin} from 'antd';

import {createApplication, createDataSource, updateApplication, updateDataSource} from "../../api";
import {readApplication} from '../../api';
import Error from "../../components/Error";

import './DataSourceCreation.css';
import withCurrentUser from "../../hoc/user/withCurrentUser.jsx";
import DataSourcePage from "../../data-source/DataSourcePage";
import emptyDataSource from "../../data-source/emptyDataSource.json"

class DataSourceCreation extends React.Component {

    constructor(props) {
        super(props);
        const application_id = queryString.parse(this.props.location.search).application;
        this.state = {
            loading: false,
            error: null,
            application_id: application_id,
        };
        if (application_id != undefined) {
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

    handleSubmit = (dataSource) => {
        this.setState({
            loading: true,
            error: null,
        });
        if (dataSource.application.id) {
            updateApplication(
                dataSource.application.id,
                dataSource.application,
            ).then((response) => {
                createDataSource(
                    dataSource,
                ).then((results) => {
                    this.props.history.push("/data-source/" + results.data.id)
                }).catch((error) => {
                    this.setState({
                        loading: false,
                        error,
                    });
                })
            }).catch((error) => {
                this.setState({
                    loading: false,
                    error,
                });
            })
        } else {
            createApplication(
                dataSource.application
            ).then((response) => {
                dataSource.application.id = response.data.id
                createDataSource(
                    dataSource,
                ).then((results) => {
                    this.props.history.push("/data-source/" + results.data.id)
                }).catch((error) => {
                    this.setState({
                        loading: false,
                        error,
                    });
                })
            }).catch((error) => {
                this.setState({
                    loading: false,
                    error,
                });
            })
        }
    };

    render() {
        let dataSource = {}
        if (this.state.application) {
            dataSource["application_name"] = this.state.application.name;
            dataSource["application"] = this.state.application;
        }
        return (
            <Spin tip="Envoi en cours..." spinning={this.state.loading}>
                <div className="DataSourceCreation">
                    {this.state.error && <Error error={this.state.error}/>}
                    <div>
                        <DataSourcePage forceEdit={true} dataSource={emptyDataSource} handleSubmit={this.handleSubmit}/>
                    </div>
                </div>
            </Spin>
        );
    }
}

export default withCurrentUser(withRouter(DataSourceCreation));
