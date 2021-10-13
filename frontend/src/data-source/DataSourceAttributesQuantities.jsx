import React from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Tag, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import './DataSourceAttributesQuantities.css';


class DataSourceAttributesQuantities extends React.Component {

    toLocaleString(value) {
        if (value){
            return value.toLocaleString('fr');
        }
        else{
            return value
        }
    }

    render() {
        return (<div className="DataSourceAttributesQuantities">
                <div className="container">
                    <h2>
                        Métriques
                    </h2>
                    <p><b>Volumétrie <QuestionCircleOutlined title="Nb de lignes ou d’objets unitaires exploités (images, fichiers, documents…)"/> : </b> {this.toLocaleString(this.props.dataSource.volumetry)}
                        <span className="gris">{this.props.dataSource.volumetry_comment ? " (" + this.props.dataSource.volumetry_comment + ")" : null}</span></p>
                    <p><b>Prod. par mois <QuestionCircleOutlined title="Nb de lignes ou d’objets unitaires créés par mois"/> : </b> {this.toLocaleString(this.props.dataSource.monthly_volumetry)}
                        <span className="gris">{this.props.dataSource.monthly_volumetry_comment ? " (" + this.props.dataSource.monthly_volumetry_comment + ")" : null}</span></p>
                    <p><b>MàJ <QuestionCircleOutlined title="Fréquence des mises à jour de la donnée"/> : </b> {this.props.dataSource.update_frequency_name}</p>
                    <p><b>Base/index <QuestionCircleOutlined title="Nom de la base ou index"/> : </b> {this.props.dataSource.database_name}</p>
                    <p><b>Table <QuestionCircleOutlined title="Nom de la table"/> : </b> {this.props.dataSource.database_table_name}</p>
                    <p><b>Nb de tables dans la base <QuestionCircleOutlined title="Nb de tables dans la base"/> : </b> {this.toLocaleString(this.props.dataSource.database_table_count)}</p>
                    <p><b>Champs <QuestionCircleOutlined title="Noms des champs dans la table"/> : </b> {this.props.dataSource.fields}</p>
                    <p><b>Nb de champs dans la table <QuestionCircleOutlined title="Nb de champs dans la table"/> : </b> {this.toLocaleString(this.props.dataSource.field_count)}</p>
                    <p><b>Nb de référentiels utilisés <QuestionCircleOutlined title="Nb de référentiels classifiant la donnée"/> : </b> {this.toLocaleString(this.props.dataSource.nb_referentiels)}</p>
                    <p><b>Nb de réutilisations <QuestionCircleOutlined title="Nb de réutilisations"/> : </b> {this.toLocaleString(this.props.dataSource.nb_reutilizations)}</p>
                </div>
        </div>);
    }
}

export default withRouter(DataSourceAttributesQuantities);
