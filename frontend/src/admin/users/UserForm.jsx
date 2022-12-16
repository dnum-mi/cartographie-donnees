import React, {useState} from 'react';
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

const UserForm = ({ isNewUser, onSubmit, user = {}, withOwnedApplications, tooltips}) => {
    const [form] = Form.useForm();
    const [passwordConfirmationRequired, setPasswordConfirmationRequired] = useState(false);

    const onValuesChange = (changedValues, allValues) => {
        const anyPassword = allValues.password
            ? Object.values(allValues.password).filter(Boolean).length > 0
            : false;
        setPasswordConfirmationRequired(anyPassword);
    };

    return (
        <Form
            {...formItemLayout}
            form={form}
            name="user-form"
            onFinish={onSubmit}
            className="form-container"
            scrollToFirstError
            initialValues={user}
            onValuesChange={onValuesChange}
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

            {withOwnedApplications && <UserOwnership user={user} />}
            <PasswordFields isNewUser={!!isNewUser} passwordConfirmationRequired={passwordConfirmationRequired}/>

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
