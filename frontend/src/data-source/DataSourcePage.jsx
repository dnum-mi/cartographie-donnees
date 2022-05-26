import React from 'react';
import { withRouter } from 'react-router-dom';
import { Modal} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import {readDataSource, deleteDataSource, updateDataSource, updateApplication} from '../api';
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
            initialDataSource: null,
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
        return readDataSource(this.props.match.params.dataSourceId)
            .then((response) => {
                const dataCopy = Object.assign({}, response.data);
                Object.freeze(dataCopy);
                this.setState({
                    dataSource: response.data,
                    initialDataSource: dataCopy,
                    loading: false,
                    error: null,
                });
            })
            .catch((error) => {
                this.setState({
                    dataSource: null,
                    initialDataSource: null,
                    loading: false,
                    error,
                });
            });
    }

    showDeleteConfirm = (event) => {
        event.preventDefault();
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
                        this.props.history.replace('/');
                    });
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

    activateEdition = (event) => {
        event.preventDefault();
        this.setState({ editMode: true })
    };

    updateDataSourceState = (newProps) => {
        const {
            application: newApplicationProps,
            ...newDataSourceProps
        } = newProps;
        const newDataSource = {...this.state.dataSource, ...newDataSourceProps};

        if (newApplicationProps) {
            newDataSource.application = {
                ...this.state.dataSource.application,
                ...newApplicationProps,
            };
        }
        this.setState({ dataSource: newDataSource })
    };

    handleSubmit = (event) => {
        event.preventDefault();
        this.setState({
            loading: true,
            error: null,
        });
        updateApplication(
          this.state.dataSource.application.id,
          this.state.dataSource.application,
        )
          .then(() => updateDataSource(
            this.props.match.params.dataSourceId,
            this.state.dataSource,
          ))
          .then(() => this.readDataSourceFromApi())
          .then(() => {
              this.setState({
                  loading: false,
                  editMode: false,
              });
          })
          .catch((error) => {
              this.setState({
                  loading: false,
                  error,
              });
          });
    };

    onCancelEdition = (event) => {
        event.preventDefault();
        const freshDataSource = Object.assign({}, this.state.initialDataSource);
        this.setState({
            dataSource: freshDataSource,
            editMode: false,
        })
    };

    renderContent() {
        if (this.state.loading) {
            return (
              <div style={{ 'marginTop': 30 }}>
                  <Loading />
              </div>
            );
        }
        if (this.state.error) {
            return (
              <div style={{ 'marginTop': 30 }}>
                  <Error error={this.state.error}/>
              </div>
            );
        }
        return (
            <form onSubmit={this.handleSubmit}>
                {this.userHasAdminPrivileges() && (
                    <DataSourceAdminHeader
                      editMode={this.state.editMode}
                      onActivateEdition={(e) => this.activateEdition(e)}
                      onCancelEdition={(e) => this.onCancelEdition(e)}
                      onDelete={(e) => this.showDeleteConfirm(e)}
                    />
                )}
                <DataSourceMainSection
                  editMode={this.state.editMode}
                  dataSource={this.state.dataSource}
                  onChange={this.updateDataSourceState}
                />
                <DataSourceMetricsSection
                  editMode={this.state.editMode}
                  dataSource={this.state.dataSource}
                  onChange={this.updateDataSourceState}
                />
                <DataSourceReutilisationsSection
                  editMode={this.state.editMode}
                  dataSource={this.state.dataSource}
                  onChange={this.updateDataSourceState}
                />
            </form>
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
