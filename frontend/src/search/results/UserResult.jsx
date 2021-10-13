import React from "react";
import { withRouter, Link } from "react-router-dom";
import { Tooltip } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import './UserResult.css';


class UserResult extends React.Component {
    render() {
        return (
            <div className="UserResult">
                <Link to={'/admin/users/' + this.props.user.id}>
                    <h3>
                        {this.props.user.first_name} {this.props.user.last_name}
                    </h3>
                </Link>
                <Tooltip title="Ouvrir l'utilisateur dans un nouvel onglet">
                    <Link className="newTab" to={'/admin/users/' + this.props.user.id} target="_blank" rel="noopener noreferrer"><ExportOutlined/></Link>
                </Tooltip>
            </div>
        );
    }
}

export default withRouter(UserResult);
