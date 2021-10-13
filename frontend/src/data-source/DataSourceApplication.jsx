import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Form, Tag, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined, MailOutlined } from '@ant-design/icons';

import './DataSourceApplication.css';
import '../components/forms.css';
import EnumTags from "../components/EnumTags";


class DataSourceApplication extends React.Component {

    render() {
        return (<div className="DataSourceApplication">
                    <div className="container">
                        <div>
                            <h2>
                                Application
                            </h2>
                            <h3>
                                {this.props.dataSource.application.name}
                            </h3>
                        </div>
                        <p>
                            <b>Organisation <QuestionCircleOutlined title= "MOA propriétaire de la donnée"/> : </b><Tag color="volcano">{this.props.dataSource.application.organization_name}</Tag>
                        </p>
                        <p>
                            <b>Contact <QuestionCircleOutlined title= "Contact du gestionnaire de la donnée"/> : </b>
                            {this.props.dataSource.application.context_email}
                            {this.props.dataSource.application.context_email ? <a  href={"mailto:"+this.props.dataSource.application.context_email}> <MailOutlined title= "Contacter le gestionnaire de la donnée" color="grey"/></a>: null}
                        </p>
                        <div>
                            <Link to={'/application/' + this.props.dataSource.application.id}>
                                <Button title= "Ouvrir l'application de la donnée" className="block">Voir la fiche de l'application</Button>
                            </Link>
                        </div>
                    </div>
        </div>);
    }
}
export default withRouter(DataSourceApplication);
