import React from 'react';
import PropTypes from 'prop-types';
import {
    Form,
    Input,
    Button,
    Checkbox,
    Tooltip
} from 'antd';
import '../../components/forms.css';
import EnumSelect from "../../components/EnumSelect";
import ApplicationSearchSelect from "../../components/ApplicationSearchSelect";
import ApplicationSearchTag from "../../components/ApplicationSearchTag";

const { TextArea } = Input;

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

const DataSourceForm = ({ onSubmit, dataSource = {} }) => {
    const [form] = Form.useForm();
    if (dataSource) {
        form.setFieldsValue({
            application: dataSource.application
        });
    }

    return (
        <Form
            {...formItemLayout}
            form={form}
            name="data-sources-form"
            onFinish={onSubmit}
            className="form-container"
            scrollToFirstError
            initialValues={dataSource}
        >
            <Form.Item
                name="name"
                label="Nom de la donnée"
                tooltip="Libellé fonctionnel de la donnée"
                rules={[
                    {
                        required: true,
                        message: 'Merci de renseigner le nom de la donnée',
                    },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
                tooltip="Description fonctionnelle de la donnée"
            >
                <TextArea TextArea={4} />
            </Form.Item>

            <Form.Item
                label="Application"
                name="application"
                tooltip="Application hébergeant la donnée"
                rules={[
                    {
                        required: true,
                        message: 'Merci de renseigner l\'application à laquelle appartient cette donnée',
                    },
                ]}
            >
                <ApplicationSearchSelect limited={true} />
            </Form.Item>

            <Form.Item
                name="family_name"
                label="Familles"
                tooltip="Famille fonctionnelle de la donnée"
                rules={[
                    {
                        required: true,
                        message: 'Merci de renseigner la / les famille(s) de la donnée',
                    },
                ]}
            >
                <EnumSelect
                    mode="multiple"
                    category="Famille"
                />
            </Form.Item>

            <Form.Item
                name="type_name"
                label="Type"
                tooltip="Type de la donnée"
                rules={[
                    {
                        required: true,
                        message: 'Merci de renseigner le type de la donnée',
                    },
                ]}
            >
                <EnumSelect
                    category="Type"
                    required
                />
            </Form.Item>
            <Tooltip title="La donnée appartient-elle au ministère de l'intérieur ?">
                <Form.Item
                    {...tailFormItemLayout}
                    name="ministry_interior"
                    valuePropName="checked"
                >
                    <Checkbox>Ministère de l'intérieur ?</Checkbox>
                </Form.Item>
            </Tooltip>

            <Tooltip title="La donnée est-elle géolocalisable ?">
                <Form.Item
                    {...tailFormItemLayout}
                    name="geo_localizable"
                    valuePropName="checked"
                >
                    <Checkbox>Géolocalisable ?</Checkbox>
                </Form.Item>
            </Tooltip>

            <Tooltip title="La donnée est elle transformée ?">
                <Form.Item
                    {...tailFormItemLayout}
                    name="transformation"
                    valuePropName="checked"
                >
                    <Checkbox>Transformation ?</Checkbox>
                </Form.Item>
            </Tooltip>

            <Form.Item
                name="example"
                label="Exemple"
                tooltip="Exemple de donnée"
            >
                <Input TextArea={2} />
            </Form.Item>

            <Form.Item
                name="referentiel_name"
                label="Référentiel"
                tooltip="Type de référentiel s’il s’agit d’une donnée référentielle (par opposition aux données opérationnelles)"
            >
                <EnumSelect
                    category="Référentiel"
                />
            </Form.Item>

            <Form.Item
                name="sensibility_name"
                label="Sensibilité"
                tooltip="Sensibilité des données identifiante"
            >
                <EnumSelect
                    category="Sensibilité"
                />
            </Form.Item>

            <Form.Item
                name="open_data_name"
                label="Open Data"
                tooltip="La donnée est-elle publiable en Open Data ?"
            >
                <EnumSelect
                    category="OpenData"
                />
            </Form.Item>

            <Form.Item
                name="database_name"
                label="Base / Index"
                tooltip="Nom de la base ou index"
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="database_table_name"
                label="Tables"
                tooltip="Nom de la table"
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="database_table_count"
                label="Nombre de tables dans la base"
                tooltip="Nb de tables dans la base"
            >
                <Input type="number" min="-2147483648" max="2147483647" />
            </Form.Item>

            <Form.Item
                name="fields"
                label="Champs"
                tooltip="Noms des champs dans la table"
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="field_count"
                label="Nombre de champs dans la table"
                tooltip="Nb de champs dans la table"
            >
                <Input type="number" min="-2147483648" max="2147483647" />
            </Form.Item>

            <Form.Item
                name="volumetry"
                label="Volumétrie"
                tooltip="Nb de lignes ou d’objets unitaires exploités (images, fichiers, documents…)"
            >
                <Input type="number" min="-2147483648" max="2147483647" />
            </Form.Item>

            <Form.Item
                name="volumetry_comment"
                label="Commentaire sur la volumétrie"
                tooltip="Commentaire sur la volumétrie"
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="monthly_volumetry"
                label="Production par mois"
                tooltip="Nb de lignes ou d’objets unitaires créés par mois"
            >
                <Input type="number" min="-2147483648" max="2147483647" />
            </Form.Item>

            <Form.Item
                name="monthly_volumetry_comment"
                label="Commentaire sur la production par mois"
                tooltip="Commentaire sur la production par mois"
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="update_frequency_name"
                label="Fréquence des mises à jour"
                tooltip="Fréquence des mises à jour de la donnée"
            >
                <EnumSelect
                    category="Mise à jour"
                />
            </Form.Item>

            <Form.Item
                name="conservation"
                label="Durée de conservation"
                tooltip="Durée de conservation de la donnée"
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="classification_name"
                label="Axes d'analyse"
                tooltip="Types de référentiels utilisés pour classifier la donnée"
            >
                <EnumSelect
                    mode="multiple"
                    category="Classification"
                />
            </Form.Item>

            <Form.Item
                name="origin_name"
                label="Origine"
                tooltip="Origine fonctionnelle de la donnée"
            >
                <EnumSelect
                    category="Origine"
                />
            </Form.Item>

            <Form.Item
                name="exposition_name"
                label="Exposition"
                tooltip="Type de mises à disposition"
            >
                <EnumSelect
                    mode="multiple"
                    category="Exposition"
                />
            </Form.Item>

            <Form.Item
                name="reutilizations"
                label="Réutilisations"
                tooltip="Application de réutilisation"
            >
                <ApplicationSearchTag limited={false} />
            </Form.Item>

            <Form.Item
                label="Application d'origine"
                name="origin_application"
                tooltip="Application d’origine le cas échéant"
            >
                <ApplicationSearchSelect limited={false} />
            </Form.Item>

            <Form.Item
                name="tag_name"
                label="Tags"
                tooltip="Tags de la donnée"
            >
                <EnumSelect
                    mode="tags"
                    category="Tag"
                />
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                    Valider
                </Button>
            </Form.Item>
        </Form>
    );
};

DataSourceForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
}

export default DataSourceForm;
