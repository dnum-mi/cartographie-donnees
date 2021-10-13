import React from 'react';
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';

import DataSourceForm from './DataSourceForm';
import {readDataSource, updateDataSource} from "../../api";
import Error from "../../components/Error";

import './DataSourceUpdate.css';
import Loading from "../../components/Loading";


class DataSourceUpdate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            initialLoading: false,
            initialError: null,
            dataSource: null,
            loading: false,
            error: null,
        };
    }

    componentDidMount() {
        this.readDataSourceFromApi();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.match.params.dataSourceId !== this.props.match.params.dataSourceId) {
            this.readDataSourceFromApi();
        }
    }

    readDataSourceFromApi() {
        this.setState({
            initialLoading: true,
            initialError: null,
        });
        readDataSource(this.props.match.params.dataSourceId)
            .then((response) => {
                this.setState({
                    dataSource: response.data,
                    initialLoading: false,
                    initialError: null,
                });
            })
            .catch((error) => {
                this.setState({
                    dataSource: null,
                    initialLoading: false,
                    initialError: error,
                });
            });
    }

    submitForm = (dataSource) => {
        this.setState({ loading: true });
        updateDataSource(this.props.match.params.dataSourceId, dataSource)
            .then(() => {
                this.props.history.push('/data-source/' + this.props.match.params.dataSourceId)
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error,
                });
            });
    };

    render() {
        if (this.state.initialLoading) {
            return <Loading />;
        }
        if (this.state.initialError) {
            return <Error error={this.state.error} />;
        }
        return (
            <Spin tip="Envoi en cours..." spinning={this.state.loading}>
                <div className="DataSourceUpdate">
                    <h1>
                        Mise à jour de la donnée
                    </h1>
                    {this.state.error && <Error error={this.state.error} />}
                    <div>
                        <DataSourceForm
                            dataSource={this.state.dataSource}
                            onSubmit={this.submitForm}
                        />
                    </div>
                </div>
            </Spin>
        );
    }
}

export default withRouter(DataSourceUpdate);
