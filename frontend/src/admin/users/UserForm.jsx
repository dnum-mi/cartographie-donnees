import React from 'react';
import PropTypes from 'prop-types'
import withTooltips from "../../hoc/tooltips/withTooltips";
import {
    Form,
    Input,
    Button,
    Checkbox,
} from 'antd';
import '../../components/forms.css';
import PasswordFields from "../../components/PasswordFields";
import EmailField from "../../components/EmailField";
import UserOwnership from "./UserOwnership";

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

const UserForm = ({ withPassword, onSubmit, user = {}, withOwnedApplications, tooltips}) => {
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
                tooltip={tooltips.get("first_name")}
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
                tooltip={tooltips.get("last_name")}
                rules={[
                    {
                        required: true,
                        message: 'Merci de renseigner le nom de l\'administrateur',
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <EmailField tooltip={tooltips.get("last_name")} required={true} name="email"/>
            <Form.Item
                name="is_admin"
                label="Administrateur général"
                tooltip={tooltips.get("is_admin")}
                valuePropName="checked"
            >
                <Checkbox />
            </Form.Item>

            {withPassword && <PasswordFields />}

            {withOwnedApplications && <UserOwnership user={user} />}


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

export default withTooltips(UserForm);
