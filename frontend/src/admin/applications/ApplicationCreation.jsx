import React from 'react';
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';

import ApplicationForm from './ApplicationForm';
import { createApplication } from "../../api";
import Error from "../../components/Error";

import './ApplicationCreation.css';


class ApplicationCreation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
        };
    }

    submitForm = (application) => {
        this.setState({ loading: true });
        if (application.validation_date){
            application.validation_date = application.validation_date.format('DD/MM/YYYY');
        }
        createApplication(application)
            .then(() => {
                this.props.count();
                this.props.history.push('/admin/applications')
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error,
                });
            });
    };

    render() {
        return (
            <Spin tip="Envoi en cours..." spinning={this.state.loading}>
                <div className="ApplicationCreation">
                    <h1>
                        Création d'une application
                    </h1>
                    {this.state.error && <Error error={this.state.error} />}
                    <div>
                        <ApplicationForm user={this.props.user} onSubmit={this.submitForm} />
                    </div>
                </div>
            </Spin>
        );
    }
}

export default withRouter(ApplicationCreation);
