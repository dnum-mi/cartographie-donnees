import React from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Tag, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import './ApplicationAttributes.css';


class ApplicationAttributes extends React.Component {

    toLocaleString(value) {
        if (value){
            return value.toLocaleString('fr');
        }
        else{
            return value
        }
    }

    render() {
        return (<div className="ApplicationAttributes">
            <p> <b>Finalités de l’application <QuestionCircleOutlined title="Finalités de l’application"/> : </b>{this.props.application.goals}</p>
            <p> <b>Expérimentations potentielles <QuestionCircleOutlined title="Expérimentations potentielles" /> : </b>{this.props.application.potential_experimentation}</p>

            <p><b>Nombre d'opérateurs <QuestionCircleOutlined title="Nb d’opérateurs de l’application (saisie, maj des données)" /> : </b>{this.toLocaleString(this.props.application.operator_count)}
                        <span className="gris">{this.props.application.operator_count_comment ? " (" + this.props.application.operator_count_comment + ")" : null}</span></p>
            <p><b>Nombre d'utilisateurs <QuestionCircleOutlined title="Nb d’utilisateurs de l’application en consultation" /> : </b>{this.toLocaleString(this.props.application.user_count)}
                        <span className="gris">{this.props.application.user_count_comment ? " (" + this.props.application.user_count_comment + ")" : null}</span></p>
            <p><b>Nombre de connexions mensuelles <QuestionCircleOutlined title="Nb de connexions d’utilisateurs uniques de l’application par mois" /> : </b>{this.toLocaleString(this.props.application.monthly_connection_count)}
                        <span className="gris">{this.props.application.monthly_connection_count_comment ? " (" + this.props.application.monthly_connection_count_comment + ")" : null}</span></p>
            <div className="grid">
                <span className="shortLabel one"> <b>Date de validation <QuestionCircleOutlined title="Validité de la présente cartographie pour publication" /> : </b>{this.props.application.validation_date}</span>
                <span className="shortLabel two"> <b>Historique <QuestionCircleOutlined title="Année création des  données les plus anciennes"/> : </b>{this.props.application.historic}</span>
            </div>
        </div>);
    }
}

export default withRouter(ApplicationAttributes);
