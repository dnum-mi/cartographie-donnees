import React from 'react';
import { withRouter } from 'react-router-dom';
import { Modal} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import {deleteDataSource} from '../api';
import DataSourceAdminHeader from './DataSourceAdminHeader';
import DataSourceMainSection from './DataSourceMainSection';

import './DataSourcePage.css';
import DataSourceMetricsSection from "./DataSourceMetricsSection";
import DataSourceReutilisationsSection from "./DataSourceReutilizationsSection";
import withCurrentUser from "../hoc/user/withCurrentUser";


const { confirm } = Modal;

class DataSourcePage extends React.Component {

    static defaultProps = {
        forceEdit: false
    }

    constructor(props) {
        super(props);
        this.state = {
            dataSource: Object.assign({}, this.props.dataSource),
            editMode: props.forceEdit,
        }
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

    onCancelEdition = (event) => {
        event.preventDefault();
        const freshDataSource = Object.assign({}, this.props.dataSource);
        this.setState({
            dataSource: freshDataSource,
            editMode: false,
        })
    };

    submit = (event) => {
        this.props.handleSubmit(event, this.state.dataSource)
    }

    renderContent() {
        return (
            <form onSubmit={this.submit}>
                {(this.props.forceEdit || this.props.currentUser.userHasAdminRightsToDatasource(this.state.dataSource)) && (
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

export default withRouter(withCurrentUser(DataSourcePage));
