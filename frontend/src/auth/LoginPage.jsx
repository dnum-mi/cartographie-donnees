import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import './LoginPage.css';
import { login } from '../api';
import { login as doLogin } from '../auth/index';
import Loading from "../components/Loading";
import Error from "../components/Error";
import EmailField from "../components/EmailField";

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
        };
    }

    onFinish = ({ email, password }) => {
        login(email, password)
            .then((response) => {
                doLogin(response.data.token);
                return this.props.onLogin();
            })
            .then(() => {
                this.props.history.push('/');
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error,
                });
            })
    };

    render() {
        if (this.state.loading) {
            return <Loading />
        }
        return (
            <div className="LoginPage">
                <h1>
                    Connexion
                </h1>
                <Form
                    {...layout}
                    name="basic"
                    onFinish={this.onFinish}
                    onFinishFailed={() => {}}
                    data-test="login-form"
                >
                <EmailField tooltip="L'email de l'administrateur" required={true} name="email"/>

                    <Form.Item
                        label="Mot de passe"
                        name="password"
                        rules={[{
                            required: true,
                            message: 'Merci de renseigner votre mot de passe',
                            validationTrigger: 'onBlur'
                        }]}
                    >
                        <Input.Password data-test="password" />
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit" data-test="login-btn">
                            Se connecter
                        </Button>
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Link to="/forgot-password">
                            Mot de passe oublié ?
                        </Link>
                    </Form.Item>
                </Form>
                {this.state.error && (
                    <Error error={{
                        message: 'Votre adresse email ou votre mot de passe sont incorrects.'
                    }} />
                )}
            </div>
        );
    }
}

export default withRouter(LoginPage);
