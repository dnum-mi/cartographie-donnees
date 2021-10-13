import React from 'react';
import PropTypes from 'prop-types';
import {
    Form,
    Input,
    Button,
    DatePicker
} from 'antd';
import moment from 'moment';
import '../../components/forms.css';
import EnumSelect from "../../components/EnumSelect";
import UserSearchSelect from "../../components/UserSearchSelect";
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

const ApplicationForm = ({ onSubmit, user, application = {} }) => {
    const [form] = Form.useForm();
    const dateFormat = "DD/MM/YYYY";
    let initialValue;
    if (application){
        initialValue = {...application}
        if (initialValue["validation_date"]){
            initialValue.validation_date = moment(initialValue["validation_date"], dateFormat);
        }
    }
    else{
        initialValue = {};
    }
    const { TextArea } = Input;
    return (
        <Form
            {...formItemLayout}
            form={form}
            name="application-form"
            onFinish={onSubmit}
            className="form-container"
            scrollToFirstError
            initialValues={initialValue}
        >
            <Form.Item
                name="name"
                label="Nom de l'application"
                tooltip="Libellé fonctionnel de l'application"
                rules={[
                    {
                        required: true,
                        message: 'Libellé fonctionnel de l\'application',
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="organization_name"
                label="Organisation"
                tooltip="MOA propriétaire de l'application"
                rules={[
                    {
                        required: true,
                        message: 'Merci de renseigner l\'organisation de l\'application',
                    },
                ]}
            >
                <EnumSelect
                    category="Organisation"
                    required
                />
            </Form.Item>
            <Form.Item
                name="goals"
                label="Finalités de l'application"
                tooltip="Finalités de l’application"
                rules={[
                    {
                        required: true,
                        message: 'Merci de renseigner la finalité de l\'application',
                    },
                ]}
            >
                <TextArea rows={4}/>
            </Form.Item>
            <Form.Item
                name="potential_experimentation"
                label="Expérimentations potentielles"
                tooltip="Expérimentations potentielles de l’application"
            >
                <TextArea rows={3}/>
            </Form.Item>
            <Form.Item
                name="access_url"
                label="Accès"
                tooltip="Site internet  de l’application"
            >
                <Input type="url"/>
            </Form.Item>
            <Form.Item
                name="operator_count"
                label="Nombre d'opérateurs"
                tooltip="Nb d’opérateurs de l’application (saisie, maj des données)"
            >
                <Input type="number" min="-2147483648" max="2147483647"/>
            </Form.Item>
            <Form.Item
                name="operator_count_comment"
                label="Commentaire sur le nombre d'opérateurs"
                tooltip="Commentaire sur le nombre d'opérateurs de l'application"
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="user_count"
                label="Nombre d'utilisateurs"
                tooltip="Nb d’utilisateurs de l’application en consultation"
            >
                <Input type="number" min="-2147483648" max="2147483647"/>
            </Form.Item>
            <Form.Item
                name="user_count_comment"
                label="Commentaire sur le nombre d'utilisateurs"
                tooltip="Commentaire sur le nombre d'utilisateurs de l’application"
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="monthly_connection_count"
                label="Nombre de connexions mensuelles"
                tooltip="Nb de connexions d’utilisateurs uniques de l’application par mois"
            >
                <Input type="number" min="-2147483648" max="2147483647"/>
            </Form.Item>
            <Form.Item
                name="monthly_connection_count_comment"
                label="Commentaire sur le nombre connexions mensuelles"
                tooltip="Commentaire sur le nombre de connexions mensuelles de l'application"
            >
                <Input />
            </Form.Item>

            <EmailField tooltip="Contact du gestionnaire de la donnée"  required={false} name="context_email"/>
            {user.is_admin &&
                (<Form.Item
                    label="Propriétaires"
                    name="owners"
                    tooltip="Liste des administrateurs de l'application"
                >
                    <UserSearchSelect />
                </Form.Item>)
            }
            <Form.Item
                label="Date de validation"
                name="validation_date"
                tooltip="Validité de la présente cartographie pour publication"
            >
            <DatePicker
                format={dateFormat}
            />
            </Form.Item>
            <Form.Item
                label="Historique"
                name="historic"
                tooltip="Année création des  données les plus anciennes"
            >
                <Input type="number" min="-2147483648" max="2147483647"/>
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                    Valider
                </Button>
            </Form.Item>
        </Form>
    );
};

ApplicationForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
}

export default ApplicationForm;
