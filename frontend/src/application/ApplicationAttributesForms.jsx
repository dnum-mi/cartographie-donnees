import React from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Tag } from 'antd';

import './ApplicationAttributesForms.css';
import '../components/forms.css';


class ApplicationAttributesForms extends React.Component {

    render() {
        return (
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                className="form-container attributes"
                initialValues={this.props.application}
            >
                <Form.Item label="Nom">
                    <span className="ant-form-text">
                        {this.props.application.name}
                    </span>
                </Form.Item>
                <Form.Item label="Organisation">
                    <Tag color="red">
                        {this.props.application.organization_name}
                    </Tag>
                </Form.Item>
                <Form.Item label="Finalités de l'application">
                    <span className="ant-form-text">
                        {this.props.application.goals}
                    </span>
                </Form.Item>
                <Form.Item label="Expérimentations potentielles">
                    <span className="ant-form-text">
                        {this.props.application.potential_experimentation}
                    </span>
                </Form.Item>
                <Form.Item label="Constact">
                    <span className="ant-form-text">
                        {this.props.application.context_email}
                    </span>
                </Form.Item>
                <Form.Item label="Accès">
                    <span className="ant-form-text">
                        {this.props.application.access_url}
                    </span>
                </Form.Item>
                <Form.Item label="Nombre d'opérateurs">
                    <span className="ant-form-text">
                        {this.props.application.operator_count}
                    </span>
                </Form.Item>
                <Form.Item label="Nombre d'utilisateurs">
                    <span className="ant-form-text">
                        {this.props.application.user_count}
                    </span>
                </Form.Item>
                <Form.Item label="Production par mois">
                    <span className="ant-form-text">
                        {this.props.application.monthly_connection_count}
                    </span>
                </Form.Item>
            </Form>
        );
    }
}

export default withRouter(ApplicationAttributesForms);
