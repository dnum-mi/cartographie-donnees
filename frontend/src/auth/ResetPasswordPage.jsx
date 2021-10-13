import React from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Button } from 'antd';
import './ResetPasswordPage.css';
import { resetPassword } from '../api';
import PasswordFields from '../components/PasswordFields';
import Loading from "../components/Loading";
import Error from "../components/Error";

const layout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
};
const tailLayout = {
    wrapperCol: { offset: 12, span: 12 },
};

class ResetPasswordPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
        };
    }

    onFinish = ({ password }) => {
        resetPassword(this.props.match.params.token, password)
            .then(() => {
                this.setState({
                    loading: false,
                    error: null,
                });
                this.props.history.push('/login');
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
            <div className="ResetPasswordPage">
                <h1>
                    Mise à jour de votre mot de passe
                </h1>
                <Form
                    {...layout}
                    name="basic"
                    onFinish={this.onFinish}
                    onFinishFailed={() => {}}
                >
                    <PasswordFields />

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            Mettre à jour
                        </Button>
                    </Form.Item>
                </Form>
                {this.state.error && (
                    <Error error={{
                        message: 'Votre token a expiré. Merci de réitérer votre demande.'
                    }} />
                )}
            </div>
        );
    }
}

export default withRouter(ResetPasswordPage);
