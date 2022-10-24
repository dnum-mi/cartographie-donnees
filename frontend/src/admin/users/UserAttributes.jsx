import React from 'react';
import { withRouter } from 'react-router-dom';
import { QuestionCircleOutlined } from '@ant-design/icons';

import '../../components/forms.css';
import './UserAttributes.css';
import ApplicationResult from "../../search/results/ApplicationResult";
import withTooltips from '../../hoc/tooltips/withTooltips';


class UserAttributes extends React.Component {

    render() {
        return (<div className="UserAttributes">
            <p><b>Prénom <QuestionCircleOutlined title={this.props.tooltips.get("first_name")}/> : </b> {this.props.user.first_name}</p>
            <p><b>Nom <QuestionCircleOutlined title={this.props.tooltips.get("last_name")}/> : </b> {this.props.user.last_name}</p>
            <p><b>Email <QuestionCircleOutlined title={this.props.tooltips.get("email")}/> : </b>{this.props.user.email}</p>
            <span className="shortLabel"><b>Administrateur général <QuestionCircleOutlined title={this.props.tooltips.get("is_admin")}/> : </b>{this.props.user.is_admin ? <span>Oui</span> : <span>Non</span>}</span>
            <div className="applications">
                <h2 title="Applications dont il est propriétaire">
                    Applications
                </h2>
                {this.props.user.applications.map((application) => (
                    <ApplicationResult application={application} />
                ))}
            </div>
        </div>)
    }
}

export default withRouter(withTooltips(UserAttributes));
