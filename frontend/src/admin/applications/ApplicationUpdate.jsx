import React from 'react';
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';

import ApplicationForm from './ApplicationForm';
import {readApplication, updateApplication} from "../../api";
import Error from "../../components/Error";

import './ApplicationUpdate.css';
import Loading from "../../components/Loading";


class ApplicationUpdate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            initialLoading: false,
            initialError: null,
            application: null,
            loading: false,
            error: null,
        };
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
            initialLoading: true,
            initialError: null,
        });
        readApplication(this.props.match.params.applicationId)
            .then((response) => {
                this.setState({
                    application: response.data,
                    initialLoading: false,
                    initialError: null,
                });
            })
            .catch((error) => {
                this.setState({
                    application: null,
                    initialLoading: false,
                    initialError: error,
                });
            });
    }

    submitForm = (application) => {
        this.setState({ loading: true });
        if (application.validation_date){
            application.validation_date = application.validation_date.format('DD/MM/YYYY');
        }
        updateApplication(this.props.match.params.applicationId, application)
            .then(() => {
                this.props.history.push('/application/' + this.props.match.params.applicationId)
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
                <div className="ApplicationUpdate">
                    <h1>
                        Mise à jour de l'application
                    </h1>
                    {this.state.error && <Error error={this.state.error} />}
                    <div>
                        <ApplicationForm
                            user={this.props.user}
                            application={this.state.application}
                            onSubmit={this.submitForm}
                        />
                    </div>
                </div>
            </Spin>
        );
    }
}

export default withRouter(ApplicationUpdate);
