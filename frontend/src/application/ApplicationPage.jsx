import React from 'react';
import {Redirect, withRouter} from 'react-router-dom';
import {Modal} from 'antd';
import {ExclamationCircleOutlined} from '@ant-design/icons';

import {
    createDataSource,
    deleteApplication,
    exportDataSourcesOfApplication,
    importDataSourceByApplication,
    readApplication,
    updateApplication,
    updateDataSource
} from '../api';
import './ApplicationPage.css';
import DataSourcePage from "../data-source/DataSourcePage";
import emptyDataSource from "./emptyDataSourceForApplication.json";
import Error from "../components/Error";
import Loading from "../components/Loading";

const {confirm} = Modal;


class ApplicationPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            application: null,
        }
    }

    componentDidMount() {
        this.readApplicationFromApi();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.match.params.applicationId !== this.props.match.params.applicationId) {
            this.readApplicationFromApi();
        }
    }

    readApplicationFromApi() {
        this.setState({
            loading: true,
            error: null,
        });
        readApplication(this.props.match.params.applicationId, true)
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

    uploadfile = ({onSuccess, onError, file}) => {
        confirm({
            title: 'Import des données',
            icon: <ExclamationCircleOutlined/>,
            content: "Vous êtes sur le point de remplacer les données présentes dans l'application " + this.state.application.name + ". Cette action est irréversible ! \
            Vous pouvez comparer votre fichier avec la base actuelle en téléchargeant le fichier CSV à l'aide du bouton\
            d'export. Vérifiez que vous avez bien importé les applications nécessaires.",
            onOk: () => {
                this.setState({
                    loading: true,
                    error: null,
                });
                const formData = new FormData();
                formData.append("file", file);
                formData.append("application_id", this.state.application.id);
                importDataSourceByApplication(formData, this.props.match.params.applicationId)
                    .then((res) => {
                        onSuccess(null, file);
                        this.readApplicationFromApi();
                        this.setState({
                            error: null,
                        });
                    })
                    .catch((error) => {
                        this.setState({
                            loading: false,
                            error: error,
                        });
                    });
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    export = () => {
        exportDataSourcesOfApplication("Données_de_" + this.state.application.name + ".csv", this.state.application.id);
    }

    handleSubmit = (dataSource) => {
        this.setState({
            loading: true,
            error: null,
        });
        updateApplication(
            dataSource.application.id,
            dataSource.application,
        )
            .then((response) => {
                if (dataSource.name) {
                    createDataSource(
                        dataSource,
                    ).then((results) => {
                        this.props.history.push("/data-source/" + results.data.id)
                    })
                } else {
                    this.setState({
                        application: response.data,
                        loading: false,
                        error: null,
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error,
                });
            });
    };

    render() {
        if (this.state.loading) {
            return <Loading/>;
        }
        if (this.state.error) {
            return <Error error={this.state.error}/>
        }
        emptyDataSource.application = this.state.application
        return this.state.application.data_source_count > 0 ?
            (
                <Redirect to={{
                    pathname: "/search",
                    search: "?application=" + this.state.application.name
                }}/>
            ) : (
                <DataSourcePage dataSource={emptyDataSource} handleSubmit={this.handleSubmit} fromAppModification/>
            );
    }
}

export default withRouter(ApplicationPage);
