import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import {Button, Modal, Upload, Skeleton} from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';

import { fetchUsers, exportUsersUrl, importUsers, exportModel } from "../../api";
import Loading from "../../components/Loading";
import Error from "../../components/Error";
import './UsersList.css';
import UserResult from "../../search/results/UserResult";

const { confirm } = Modal;

class UsersList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            users: [],
        }
    }

    componentDidMount() {
        this.fetchUsersFromApi();
    }

    fetchUsersFromApi() {
        this.setState({
            loading: true,
            error: null,
        });

        fetchUsers()
            .then((response) => {
                this.setState({
                    users: response.data,
                    loading: false,
                    error: null,
                });
            })
            .catch((error) => {
                this.setState({
                    users: [],
                    loading: false,
                    error,
                });
            });
    }

    renderUser(user) {
        return (
            <UserResult
                user={user}
                key={user.id}
            />
        );
    }

    renderContent() {
        if (this.state.loading) {
            return (
                <div>
                    <Skeleton loading={true} active >
                    </Skeleton>
                    <Skeleton loading={true} active >
                    </Skeleton>
                    <Skeleton loading={true} active >
                    </Skeleton>
                </div>
            )
        }
        if (this.state.error) {
            return <Error error={this.state.error} />;
        }
        return this.state.users.map(this.renderUser);
    }

      uploadfile({ onSuccess, onError, file }) {
        confirm({
            title: 'Import des administrateurs',
            icon: <ExclamationCircleOutlined />,
            content: "Vous êtes sur le point de remplacer les administrateurs. Cette action est irréversible ! \
            Il ne doit pas y avoir d'application car cette table est liée aux administrateurs\
            Vous pouvez comparer votre fichier avec la base actuelle en téléchargeant le fichier CSV à l'aide du bouton\
            d'export.",
                onOk: () => {
                    this.setState({
                        loading: true,
                        error: null,
                    });
                    const formData = new FormData();
                    formData.append("file", file);
                    importUsers(formData)
                    .then(() => {
                        onSuccess(null, file);
                        this.props.count();
                        this.fetchUsersFromApi();
                    })
                    .catch((error) => {
                        this.setState({
                            users: [],
                            loading: false,
                            error,
                        });
                    });
                },
                onCancel() {
                    console.log('Cancel');
                },
            });
        };

    export = () => {
        exportModel(exportUsersUrl, "Administrateurs.csv");
    }

    render() {
        return (
            <div className="UsersList">
                <h1>
                    Liste des administrateurs
                </h1>
                <div className="actions">
                    <Link to={this.props.match.url + '/create'}>
                        <Button type="primary" icon={<PlusOutlined />}>
                            Créer un administrateur
                        </Button>
                    </Link>
                    <Button onClick={this.export} icon={<UploadOutlined />} type="default">Export</Button>
                    <Upload
                        customRequest={this.uploadfile.bind(this)}
                        maxCount={1}
                        showUploadList={false}
                    >
                        <Button icon={<DownloadOutlined />} type="default">Import</Button>
                    </Upload>
                </div>
                {this.renderContent()}
            </div>
        );
    }
}

export default withRouter(UsersList);
