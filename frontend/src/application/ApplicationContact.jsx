import React from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Tag, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined, MailOutlined, GlobalOutlined } from '@ant-design/icons';

import './ApplicationContact.css';


class ApplicationContact extends React.Component {

    render() {
        return (<div className="ApplicationContact">
                <div className="container">
                    <p>
                        <b>Organisation <QuestionCircleOutlined title="MOA propriétaire de la donnée"/> : </b>
                        <Tag color="volcano">{this.props.application.organization_name}</Tag>
                    </p>
                    <p>
                        <b>Contact <QuestionCircleOutlined title="Contact du gestionnaire de la donnée"/> : </b>
                        {this.props.application.context_email}
                        {this.props.application.context_email ? <a href={"mailto:"+this.props.application.context_email}> <MailOutlined title="Contacter le gestionnaire de la donnée" /></a> : null}
                    </p>
                    <p>
                        <b>Site <QuestionCircleOutlined title="Accès au site"/> : </b>{this.props.application.access_url}
                        {this.props.application.access_url ? <a href={this.props.application.access_url} target="_blank"> <GlobalOutlined title="Accèder au site" /></a> : null}
                    </p>
                </div>
        </div>);
    }
}

export default withRouter(ApplicationContact);
