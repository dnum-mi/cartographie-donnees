import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Modal, Button, Upload } from 'antd';
import { ExclamationCircleOutlined, UploadOutlined, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import { readApplication, deleteApplication, importDataSourceByApplication, exportDataSourcesOfApplication } from '../api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import ApplicationAttributes from './ApplicationAttributes';
import ApplicationContact from './ApplicationContact';
import './ApplicationPage.css';
import DataSourceResult from "../search/results/DataSourceResult";
import UserResult from "../search/results/UserResult";

const { confirm } = Modal;


class ApplicationPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            application: null,
        }
    }

    componentDidMount() {
        this.readApplicationFromApi();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.match.params.applicationId !== this.props.match.params.applicationId) {
            this.readApplicationFromApi();
        }
    }

    readApplicationFromApi() {
        this.setState({
            loading: true,
            error: null,
        });
        readApplication(this.props.match.params.applicationId, true)
            .then((response) => {
                this.setState({
                    application: response.data,
                    loading: false,
                    error: null,
                });
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error: error,
                });
            });
    }

    showDeleteConfirm = () => {
        this.setState({
            loading: true,
            error: null,
        });
        confirm({
            title: 'Êtes-vous sûr de vouloir supprimer cette Application ?',
            icon: <ExclamationCircleOutlined />,
            content: 'Vérifier qu\'aucunes données n\'est liées à cette application',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            onOk: () => {
                deleteApplication(this.props.match.params.applicationId)
                    .then(() => {
                        this.props.history.replace('/admin/applications');
                        this.setState({
                            loading: false,
                    })
                    })
                    .catch((error) => {
                        this.setState({
                            loading: false,
                            error: error,
                    })
                });
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }

      uploadfile = ({ onSuccess, onError, file }) => {
        confirm({
            title: 'Import des données',
            icon: <ExclamationCircleOutlined />,
            content: "Vous êtes sur le point de remplacer les données présentes dans l'application "+this.state.application.name+". Cette action est irréversible ! \
            Vous pouvez comparer votre fichier avec la base actuelle en téléchargeant le fichier CSV à l'aide du bouton\
            d'export. Vérifiez que vous avez bien importé les applications nécessaires.",
                onOk: () => {
                    this.setState({
                        loading: true,
                        error: null,
                    });
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("application_id", this.state.application.id);
                    importDataSourceByApplication(formData, this.props.match.params.applicationId)
                    .then((res) => {
                        onSuccess(null, file);
                        this.readApplicationFromApi();
                        this.setState({
                            error:null,
                        });
                    })
                    .catch((error) => {
                        this.setState({
                            loading: false,
                            error: error,
                        });
                    });
                },
                onCancel() {
                    console.log('Cancel');
                },
            });
        };

    export = () => {
        exportDataSourcesOfApplication("Données_de_" + this.state.application.name + ".csv", this.state.application.id);
    }

    userOwnsApplication = () => this.state.application && this.props.user &&
        ((this.props.user.applications
            .map((app) => app.id)
            .indexOf(this.state.application.id) > -1) || this.userHasAdminPrivileges())

    userHasAdminPrivileges = () => this.props.user && (
        this.props.user.is_admin
    );

    renderContent() {
        if (this.state.loading) {
            return <Loading />;
        }
        return (<>
            {this.state.error ? (<Error error={this.state.error}/>) : null}
            <div className="column">
                <div className="left" >
                    <h1 className="typePage">
                        Fiche de l'application
                    </h1>
                    <h1>
                        {this.state.application.name} {"(" + this.state.application.data_sources.length + " données)"}
                    </h1>
                    {this.userOwnsApplication() && (
                    <p className="actions">
                        <Link to={'/admin/applications/' + this.props.match.params.applicationId + '/update'}>
                            <Button type="default">
                                Modifier
                            </Button>
                        </Link>
                        <Button type="danger" onClick={this.showDeleteConfirm}>
                            Supprimer
                        </Button>
                    </p>
                    )}
                    <div className="attributs" >
                        <ApplicationAttributes application={this.state.application} />
                        {this.userHasAdminPrivileges() && (
                        <div className="section">
                                <h2 title="Administrateurs de l'application">
                                    Propriétaires
                                </h2>
                            <div className="owners">
                                {this.state.application.owners.map((owner) => (
                                    <UserResult user={owner} />
                                ))}
                            </div>
                        </div>
                        )}
                        <div className="section">
                            <div>
                                    <h2 title="Données de l'application">
                                        Données
                                    </h2>
                                    {this.userOwnsApplication() && (
                                    <span className="actions">
                                    <Upload
                                        className="import"
                                        customRequest={this.uploadfile}
                                        maxCount={1}
                                        showUploadList={false}
                                    >
                                        <Button icon={<UploadOutlined />} type="default">Import</Button>
                                    </Upload>
                                    <Button onClick={this.export} type="default" icon={<DownloadOutlined />}>Export</Button>
                                    <Link to={"/admin/data-sources/create?application="+this.state.application.id}><Button type="default" icon={<DownloadOutlined />}>Créer une donnée</Button></Link>
                                    </span>
                                    )}
                            </div>
                            <div className="data-sources">
                                {this.state.application.data_sources.map((dataSource) => (
                                    <DataSourceResult dataSource={dataSource} not_search={true}/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="right">
                    <ApplicationContact application={this.state.application} />
                </div>
            </div>
        </>
        );
    }

    render() {
        return (
            <div className="ApplicationPage">
                {this.renderContent()}
            </div>
        );
    }
}

export default withRouter(ApplicationPage);
