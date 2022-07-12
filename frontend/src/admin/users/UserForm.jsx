import React from 'react';
import PropTypes from 'prop-types';
import {
    Form,
    Input,
    Button,
    Checkbox,
} from 'antd';
import '../../components/forms.css';
import PasswordFields from "../../components/PasswordFields";
import EmailField from "../../components/EmailField";

const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 8,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 16,
        },
    },
};

const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 8,
        },
    },
};

const UserForm = ({ withPassword, onSubmit, user = {} }) => {
    const [form] = Form.useForm();

    return (
        <Form
            {...formItemLayout}
            form={form}
            name="user-form"
            onFinish={onSubmit}
            className="form-container"
            scrollToFirstError
            initialValues={user}
        >
            <Form.Item
                name="first_name"
                label="Prénom"
                tooltip="Prénom de l'administrateur"
                rules={[
                    {
                        required: true,
                        message: 'Merci de renseigner le prénom de l\'administrateur',
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="last_name"
                label="Nom"
                tooltip="Nom de l'administrateur"
                rules={[
                    {
                        required: true,
                        message: 'Merci de renseigner le nom de l\'administrateur',
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <EmailField tooltip="L'email de l'administrateur" required={true} name="email"/>
            <Form.Item
                name="is_admin"
                label="Administrateur général"
                tooltip="L'utilisateur est-il administrateur général ?"
                valuePropName="checked"
            >
                <Checkbox />
            </Form.Item>

            {withPassword && <PasswordFields />}

            <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                    Valider
                </Button>
            </Form.Item>
        </Form>
    );
};

UserForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
}

export default UserForm;
