import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Form, Tag } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import './DataSourceAttributes.css';
import '../components/forms.css';
import EnumTags from "../components/EnumTags";


class DataSourceAttributes extends React.Component {

    render() {
        return (<div className="DataSourceAttributes">
            <p><b>Description <QuestionCircleOutlined title="Description fonctionnelle de la donnée" /> : </b> {this.props.dataSource.description}</p>
            <p><b>Finalités de l'application <QuestionCircleOutlined title="Finalités de l’application" /> : </b> {this.props.dataSource.application.goals}</p>
            <p><b>Exemple <QuestionCircleOutlined title="Exemple de donnée" /> : </b>{this.props.dataSource.example}</p>
            <div>
                <span className="shortLabel"> <b>Familles <QuestionCircleOutlined title="Famille fonctionnelle de la donnée" /> : </b> {this.props.dataSource.family_name && this.props.dataSource.family_name.map((family_name) => (
                    <Tag color="blue">{family_name}</Tag>
                ))}</span>
            </div>
            <div>
                <span className="shortLabel"> <b>Axe d'analyse  <QuestionCircleOutlined title="Types de référentiels utilisés pour classifier la donnée" /> : </b> {this.props.dataSource.classification_name && this.props.dataSource.classification_name.map((classification_name) => (
                    <Tag color="purple">{classification_name}</Tag>
                ))}</span>
            </div>
            <div>
                <span className="shortLabel"> <b>Expositions <QuestionCircleOutlined title="Type de mises à disposition" /> : </b> {this.props.dataSource.exposition_name && this.props.dataSource.exposition_name.map((tag_name) => (
                    <Tag color="gold">{tag_name}</Tag>
                ))}</span>

            </div>
            <div>
                <span className="shortLabel"> <b>Tags <QuestionCircleOutlined title="Tags de la donnée" /> : </b> {this.props.dataSource.tag_name && this.props.dataSource.tag_name.map((tag_name) => (
                    <Tag>{tag_name}</Tag>
                ))}</span>

            </div>
            <div className="grid">
                <span className="shortLabel one"> <b>Type <QuestionCircleOutlined title="Type de la donnée" /> : </b> {this.props.dataSource.type_name && <Tag color="red">{this.props.dataSource.type_name}</Tag> }</span>
                <span className="shortLabel two"> <b>Référentiel <QuestionCircleOutlined title="Type de référentiel s’il s’agit d’une donnée référentielle (par opposition aux données opérationnelles)" /> : </b> { this.props.dataSource.referentiel_name && <Tag color="orange">{this.props.dataSource.referentiel_name}</Tag>}</span>
                <span className="shortLabel three"> <b>Sensibilité <QuestionCircleOutlined title="Sensibilité des données identifiantes" /> : </b> {this.props.dataSource.sensibility_name && <Tag color="lime">{this.props.dataSource.sensibility_name}</Tag>}</span>
                <span className="shortLabel four"> <b>Open Data <QuestionCircleOutlined title="La donnée est-elle publiable en Open Data ?" /> : </b> {this.props.dataSource.open_data_name && <Tag color="green">{this.props.dataSource.open_data_name}</Tag>}</span>
                <span className="shortLabel five"> <b>Origine <QuestionCircleOutlined title="Origine fonctionnelle de la donnée" /> : </b> {this.props.dataSource.origin_name && <Tag color="geekblue">{this.props.dataSource.origin_name}</Tag>}</span>
                <span className="shortLabel seven"><b>Ministère de l'intérieur ? <QuestionCircleOutlined title="La donnée appartient-elle au ministère de l'intérieur ?" /> : </b>{this.props.dataSource.ministry_interior ? <span>Oui</span> : <span>Non</span>}</span>
                <span className="shortLabel eight"><b>Géolocalisable ? <QuestionCircleOutlined title="La donnée est-elle géolocalisable ?" /> : </b>{this.props.dataSource.geo_localizable ? <span>Oui</span> : <span>Non</span>}</span>
                <span className="shortLabel nine"><b>Transformation ? <QuestionCircleOutlined title="La donnée est-elle transformée ?" /> : </b>{this.props.dataSource.transformation ? <span>Oui</span> : <span>Non</span>}</span>
            </div>
            <p><b>Durée de conservation <QuestionCircleOutlined title="Durée de conservation de la donnée" /> : </b>{this.props.dataSource.conservation}</p>
            <p><b>Application d'origine <QuestionCircleOutlined title="Application d’origine le cas échéant" /> : </b>
                {this.props.dataSource.origin_application ?
                    <a href={'/application/' + this.props.dataSource.origin_application.id}>
                        <span><u>{this.props.dataSource.origin_application_name}</u></span>
                    </a>
                    : null}
            </p>
        </div>);
    }
}
export default withRouter(DataSourceAttributes);
