import React from 'react';
import { withRouter } from 'react-router-dom';
import {Form, Button, Alert} from 'antd';
import './ForgotPasswordPage.css';
import { forgotPassword } from '../api';
import Loading from "../components/Loading";
import Error from "../components/Error";
import EmailField from "../components/EmailField";

const layout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
};
const tailLayout = {
    wrapperCol: { offset: 12, span: 12 },
};

class ForgotPasswordPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            success: false,
        };
    }

    onFinish = ({ email }) => {
        forgotPassword(email)
            .then(() => {
                this.setState({
                    loading: false,
                    error: null,
                    success: true,
                });
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error,
                    success: false,
                });
            })
    };

    render() {
        if (this.state.loading) {
            return <Loading />
        }
        return (
            <div className="ForgotPasswordPage">
                <h1>
                    Demande de réinitialisation de votre mot de passe
                </h1>
                <Form
                    {...layout}
                    name="basic"
                    onFinish={this.onFinish}
                    onFinishFailed={() => {}}
                >
                <EmailField tooltip="L'email de l'administrateur" required={true} name="email"/>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            Réinitialiser
                        </Button>
                    </Form.Item>
                </Form>
                {this.state.success && (
                    <Alert
                        message="Un email vous a été envoyé sur votre adresse email.
                        Cliquez sur le lien de cet email afin de réinitialiser votre mot de passe."
                        type="success"
                    />
                )}
                {this.state.error && (
                    <Error error={{
                        message: 'Votre token a expiré. Merci de réitérer votre demande.'
                    }} />
                )}
            </div>
        );
    }
}

export default withRouter(ForgotPasswordPage);
