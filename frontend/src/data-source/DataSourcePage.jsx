import React from 'react';
import { withRouter } from 'react-router-dom';
import { Modal} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { readDataSource, deleteDataSource } from '../api';
import Loading from '../components/Loading';
import Error from '../components/Error';
import DataSourceAdminHeader from './DataSourceAdminHeader';
import DataSourceMainSection from './DataSourceMainSection';

import './DataSourcePage.css';
import DataSourceMetricsSection from "./DataSourceMetricsSection";
import DataSourceReutilisationsSection from "./DataSourceReutilizationsSection";


const { confirm } = Modal;

class DataSourcePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            dataSource: null,
            editMode: false,
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
        if (this.state.error) {
            return <Error error={this.state.error}/>
        }
        return (
            <>
                {this.userHasAdminPrivileges() && (
                    <DataSourceAdminHeader
                      editMode={this.state.editMode}
                      onEditToggle={(editMode) => this.setState({ editMode })}
                    />
                )}
                <DataSourceMainSection
                  editMode={this.state.editMode}
                  dataSource={this.state.dataSource}
                />
                <DataSourceMetricsSection
                  editMode={this.state.editMode}
                  dataSource={this.state.dataSource}
                />
                <DataSourceReutilisationsSection
                  editMode={this.state.editMode}
                  dataSource={this.state.dataSource}
                />
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
