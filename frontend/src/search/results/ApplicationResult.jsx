import React from "react";
import { withRouter, Link } from "react-router-dom";
import { Tag, Typography } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import './ApplicationResult.css';

const { Paragraph } = Typography;

class ApplicationResult extends React.Component {
    render() {
        return (
            <div className="ApplicationResult">
                <Link to={'/application/' + this.props.application.id}>
                    <h3>
                        {this.props.application.name}
                    </h3>
                </Link>
                    <Link title="Ouvrir l'application dans un nouvel onglet" className="newTab" to={'/application/' + this.props.application.id} target="_blank" rel="noopener noreferrer"><ExportOutlined/></Link>
                <Paragraph className="paragraph">
                    Finalités de l'application : <span>{this.props.application.goals}</span>
                </Paragraph>
                <div className="attributes">
                    <Tag color="volcano" title={this.props.application.organization_long_name}>{this.props.application.organization_name}</Tag>
                </div>
            </div>
        );
    }
}

export default withRouter(ApplicationResult);
