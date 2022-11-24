import React from 'react';
import {withRouter} from 'react-router-dom';

import {createApplication, readDataSource, updateApplication, updateDataSource} from '../api';

import Loading from "../components/Loading";
import Error from "../components/Error";
import DataSourcePage from "./DataSourcePage";

class DataSourceFetcher extends React.Component {

    static defaultProps = {
        forceEdit: false
    }

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            loading: true,
            dataSource: null
        }
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
            loading: true,
            error: null,
        });
        return readDataSource(this.props.match.params.dataSourceId)
            .then((response) => {
                this.setState({
                    dataSource: response.data,
                    loading: false,
                    error: null,
                });
            })
            .catch((error) => {
                this.setState({
                    dataSource: null,
                    loading: false,
                    error,
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
            )
                .then(() => updateDataSource(
                    this.props.match.params.dataSourceId,
                    dataSource,
                ).catch((error) => {
                    this.setState({
                        loading: false,
                        error,
                    });
                }))
                .then(() => readDataSource(this.props.match.params.dataSourceId))
                .then(() => {
                    this.setState({
                        loading: false,
                        editMode: false,
                    });
                })
                .catch((error) => {
                    this.setState({
                        loading: false,
                        error,
                    });
                });
        }
        else {
            createApplication(
                dataSource.application,
            )
                .then(() => updateDataSource(
                    this.props.match.params.dataSourceId,
                    dataSource,
                ).catch((error) => {
                    this.setState({
                        loading: false,
                        error,
                    });
                }))
                .then(() => this.readDataSource(this.props.match.params.dataSourceId))
                .then(() => {
                    this.setState({
                        loading: false,
                        editMode: false,
                    });
                })
                .catch((error) => {
                    this.setState({
                        loading: false,
                        error,
                    });
                });
        }

    };

    render() {
        if (this.state.loading) {
            return (
                <div style={{ 'marginTop': 30 }}>
                    <Loading />
                </div>
            );
        }
        if (this.state.error) {
            return (
                <div style={{ 'marginTop': 30 }}>
                    <Error error={this.state.error}/>
                </div>
            );
        }
        return (
            <DataSourcePage {...this.props} dataSource={this.state.dataSource} handleSubmit={this.handleSubmit}/>
        );
    }
}

export default withRouter(DataSourceFetcher);
