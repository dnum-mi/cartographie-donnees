import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { readUser, deleteUser } from '../../api';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import UserAttributes from './UserAttributes';
import './UserPage.css';

const { confirm } = Modal;

class UserPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            user: null,
        }
    }

    componentDidMount() {
        this.readUserFromApi();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.match.params.userId !== this.props.match.params.userId) {
            this.readUserFromApi();
        }
    }

    readUserFromApi() {
        this.setState({
            loading: true,
            error: null,
        });
        readUser(this.props.match.params.userId)
            .then((response) => {
                this.setState({
                    user: response.data,
                    loading: false,
                    error: null,
                });
            })
            .catch((error) => {
                this.setState({
                    user: null,
                    loading: false,
                    error,
                });
            });
    }

    showDeleteConfirm = () => {
        confirm({
            title: 'Êtes-vous sûr de vouloir supprimer cet administrateur ?',
            icon: <ExclamationCircleOutlined />,
            content: 'Cette action est irréversible.',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            onOk: () => {
                deleteUser(this.props.match.params.userId)
                    .then(() => {
                        this.props.history.replace('/admin/users');
                    });
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }

    renderContent() {
        if (this.state.loading) {
            return <Loading />;
        }
        if (this.state.error) {
            return <Error error={this.state.error} />;
        }
        console.log(this.state.user)
        return (
            <div>
                <h1 className="typePage">
                    Fiche de l'administrateur
                </h1>
                <h1>
                    {this.state.user.first_name + ' ' + this.state.user.last_name}
                </h1>
                <p className="actions">
                    <Link to={'/admin/users/' + this.props.match.params.userId + '/update'}>
                        <Button type="default">
                            Modifier
                        </Button>
                    </Link>

                    <Button type="danger" onClick={this.showDeleteConfirm}>
                        Supprimer
                    </Button>
                </p>
                <UserAttributes user={this.state.user} />
            </div>
        );
    }

    render() {
        return (
            <div className="UserPage">
                {this.renderContent()}
            </div>
        );
    }
}

export default withRouter(UserPage);
