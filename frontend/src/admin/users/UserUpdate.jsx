import React from 'react';
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';

import UserForm from './UserForm';
import {readUser, updateUser} from "../../api";
import Error from "../../components/Error";
import Loading from "../../components/Loading";


class UserUpdate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            initialLoading: false,
            initialError: null,
            user: null,
            loading: false,
            error: null,
        };
    }

    componentDidMount() {
        this.readUserFromApi();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.match.params.userId !== this.props.match.params.userId) {
            this.readUserFromApi();
        }
    }

    readUserFromApi() {
        this.setState({
            initialLoading: true,
            initialError: null,
        });
        readUser(this.props.match.params.userId)
            .then((response) => {
                this.setState({
                    user: response.data,
                    initialLoading: false,
                    initialError: null,
                });
            })
            .catch((error) => {
                this.setState({
                    user: null,
                    initialLoading: false,
                    initialError: error,
                });
            });
    }

    submitForm = (user) => {
        this.setState({ loading: true });
        updateUser(this.props.match.params.userId, user)
            .then(() => {
                this.props.history.push('/admin/users/' + this.props.match.params.userId)
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
                <div className="UserUpdate">
                    <h1>
                        Mise à jour de l'administrateur
                    </h1>
                    {this.state.error && <Error error={this.state.error} />}
                    <div>
                        <UserForm
                            user={this.state.user}
                            onSubmit={this.submitForm}
                            withOwnedApplications
                        />
                    </div>
                </div>
            </Spin>
        );
    }
}

export default withRouter(UserUpdate);
