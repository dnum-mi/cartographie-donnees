import React from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Tag } from 'antd';

import './DataSourceAttributes.css';
import '../components/forms.css';
import EnumTags from "../components/EnumTags";


class DataSourceAttributes extends React.Component {

    render() {
        return (
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                className="form-container attributes"
                initialValues={this.props.dataSource}
            >
                <Form.Item label="Nom">
                    <span className="ant-form-text">
                        {this.props.dataSource.name}
                    </span>
                </Form.Item>
                <Form.Item label="Description">
                    <span className="ant-form-text">
                        {this.props.dataSource.description}
                    </span>
                </Form.Item>
                <Form.Item label="Application">
                    {this.props.dataSource.application ? (
                        <span className="ant-form-text">
                            {this.props.dataSource.application.name} ({this.props.dataSource.application.id})
                        </span>
                    ) : '-'}
                </Form.Item>
                <Form.Item label="RGPD ?">
                    <span className="ant-form-text">
                        {this.props.dataSource.is_rgpd ? 'Oui' : 'Non'}
                    </span>
                </Form.Item>
                <Form.Item label="Familles">
                    <EnumTags color="blue" enum={this.props.dataSource.family_name} />
                </Form.Item>
                <Form.Item label="Type">
                    <Tag color="magenta">
                        {this.props.dataSource.type_name}
                    </Tag>
                </Form.Item>
                <Form.Item label="Exemple">
                    <span className="ant-form-text">
                        {this.props.dataSource.example}
                    </span>
                </Form.Item>
                <Form.Item label="Référentiel">
                    <Tag>
                        {this.props.dataSource.referentiel_name}
                    </Tag>
                </Form.Item>
                <Form.Item label="Sensibilité">
                    <Tag>
                        {this.props.dataSource.sensibility_name}
                    </Tag>
                </Form.Item>
                <Form.Item label="Open Data">
                    <Tag>
                        {this.props.dataSource.open_data_name}
                    </Tag>
                </Form.Item>
                <Form.Item label="Base / Index">
                    <span className="ant-form-text">
                        {this.props.dataSource.database_name}
                    </span>
                </Form.Item>
                <Form.Item label="Tables">
                    <span className="ant-form-text">
                        {this.props.dataSource.database_table_name}
                    </span>
                </Form.Item>
                <Form.Item label="Nombre de tables">
                    <span className="ant-form-text">
                        {this.props.dataSource.database_table_count}
                    </span>
                </Form.Item>
                <Form.Item label="Champs">
                    <span className="ant-form-text">
                        {this.props.dataSource.fields}
                    </span>
                </Form.Item>
                <Form.Item label="Nombre de champs">
                    <span className="ant-form-text">
                        {this.props.dataSource.fields_count}
                    </span>
                </Form.Item>
                <Form.Item label="Volumetrie">
                    <span className="ant-form-text">
                        {this.props.dataSource.volumetry}
                    </span>
                </Form.Item>
                <Form.Item label="Production par mois">
                    <span className="ant-form-text">
                        {this.props.dataSource.monthly_volumetry}
                    </span>
                </Form.Item>
                <Form.Item label="Fréquence de mise à jour">
                    <Tag>
                        {this.props.dataSource.update_frequency_name}
                    </Tag>
                </Form.Item>
                <Form.Item label="Axes d'analyse">
                    <EnumTags enum={this.props.dataSource.classification_name} />
                </Form.Item>
                <Form.Item label="Origine">
                    <Tag>
                        {this.props.dataSource.origin_name}
                    </Tag>
                </Form.Item>
                <Form.Item label="Exposition">
                    <Tag>
                        {this.props.dataSource.exposition_name}
                    </Tag>
                </Form.Item>
            </Form>
        );
    }
}

export default withRouter(DataSourceAttributes);
