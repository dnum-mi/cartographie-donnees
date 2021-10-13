import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { readDataSource, deleteDataSource } from '../api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import DataSourceAttributes from './DataSourceAttributes';
import DataSourceApplication from './DataSourceApplication';
import DataSourceAttributesQuantities from './DataSourceAttributesQuantities';
import ApplicationResult from "../search/results/ApplicationResult";

import './DataSourcePage.css';


const { confirm } = Modal;

class DataSourcePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            dataSource: null,
        }
    }

    componentDidMount() {
        this.readDataSourceFromApi();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.match.params.dataSourceId !== this.props.match.params.dataSourceId) {
            this.readDataSourceFromApi();
        }
    }

    readDataSourceFromApi() {
        this.setState({
            loading: true,
            error: null,
        });
        readDataSource(this.props.match.params.dataSourceId)
            .then((response) => {
                this.setState({
                    dataSource: response.data,
                    loading: false,
                    error: null,
                });
            })
            .catch((error) => {
                this.setState({
                    dataSource: null,
                    loading: false,
                    error,
                });
            });
    }

    showDeleteConfirm = () => {
        confirm({
            title: 'Êtes-vous sûr de vouloir supprimer cette donnée ?',
            icon: <ExclamationCircleOutlined />,
            content: 'Cette action est irréversible.',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            onOk: () => {
                deleteDataSource(this.props.match.params.dataSourceId)
                    .then(() => {
                        this.props.history.replace('/admin/data-sources');
                    });
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }

    userOwnsDataSource = () => this.state.dataSource &&
        this.state.dataSource.application &&
        this.props.user.applications
            .map((app) => app.id)
            .indexOf(this.state.dataSource.application.id) > -1

    userHasAdminPrivileges = () => this.props.user && (
        this.props.user.is_admin ||
        this.userOwnsDataSource()
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
                        Fiche de la donnée
                    </h1>
                    <h1>
                        {this.state.dataSource.name}
                    </h1>
                    {this.userHasAdminPrivileges() && (
                    <p className="actions">
                        <Link to={'/admin/data-sources/' + this.props.match.params.dataSourceId + '/update'}>
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
                        <DataSourceAttributes dataSource={this.state.dataSource} />
                        <div className="section">
                            <h2 title="Application de réutilisation">
                                Réutilisations
                            </h2>
                            <div className="reutilizations">
                                {this.state.dataSource.reutilizations.map((application) => (
                                    <ApplicationResult application={application} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="right">
                    <DataSourceApplication dataSource={this.state.dataSource} />
                    <DataSourceAttributesQuantities dataSource={this.state.dataSource} />
                </div>
            </div>
        </>
        );
    }

    render() {
        return (
            <div className="DataSourcePage">
                {this.renderContent()}
            </div>
        );
    }
}

export default withRouter(DataSourcePage);
