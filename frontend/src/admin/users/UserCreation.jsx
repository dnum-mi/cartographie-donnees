import React from 'react';
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';

import UserForm from './UserForm';
import { createUser } from "../../api";
import Error from "../../components/Error";


class UserCreation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
        };
    }

    submitForm = (user) => {
        this.setState({ loading: true });
        createUser(user)
            .then(() => {
                this.props.count();
                this.props.history.push('/admin/users')
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
                <div className="UserCreation">
                    <h1>
                        Création d'un utilisateur
                    </h1>
                    {this.state.error && <Error error={this.state.error} />}
                    <div>
                        <UserForm withPassword onSubmit={this.submitForm} />
                    </div>
                </div>
            </Spin>
        );
    }
}

export default withRouter(UserCreation);
