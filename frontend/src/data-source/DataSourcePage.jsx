import React from 'react';
import { withRouter } from 'react-router-dom';
import {Form, Modal} from 'antd';
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
    formRef = React.createRef();

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
        this.setState({ dataSource: newDataSource }, () => {
            this.formRef.current.setFieldsValue(this.state.dataSource)
        })
    };

    onCancelEdition = (event) => {
        const freshDataSource = Object.assign({}, this.props.dataSource);
        this.formRef.current.resetFields()
        this.setState({
            dataSource: freshDataSource,
            editMode: false,
        })
    };

    submit = (event) => {
        this.props.handleSubmit(this.state.dataSource)
    }

    renderContent() {
        const validateMessages = {
            required: "'${name}' est requis!",
            types: {
                email: "${name} n'est pas un email valide (ie: ____@----.**",
                url: "${name} n'est pas une url valide (ie: http://www.___.**)",
            },
        };
        return (
            <Form onFinish={this.submit} ref={this.formRef} validateMessages={validateMessages}>
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
            </Form>
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
