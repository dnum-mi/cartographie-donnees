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
import attributes from './attributes'

const { confirm } = Modal;

class DataSourcePage extends React.Component {
    formRef = React.createRef();

    static defaultProps = {
        forceEdit: false,
        fromAppCreation: false,
        fromDataSourceCreation: false
    }

    constructor(props) {
        super(props);
        this.state = {
            dataSource: Object.assign({}, this.props.dataSource),
            editMode: props.forceEdit,
            noRules: this.props.fromAppCreation
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

    updateDataSourceState = (newAttribute, all) => {
        const newDataSource = {...this.state.dataSource}
        newDataSource.application = {...newDataSource.application}
        let attributeId = Object.keys(newAttribute)[0]
        let noRules = this.state.noRules
        for (let attributeKey in attributes) {
            if (attributes[attributeKey].attributeId === attributeId) {
                newDataSource[attributeKey] = newAttribute[attributeId]
                noRules = false
                break
            } else if (attributes[attributeKey].suffixAttributeId === attributeId) {
                newDataSource[attributeId] = newAttribute[attributeId]
                noRules = false
                break
            }
        }
        for (let attributeKey in attributes.application) {
            if (attributes.application[attributeKey].attributeId === attributeId) {
                newDataSource.application[attributeKey] = newAttribute[attributeId]
                break
            } else if (attributes.application[attributeKey].suffixAttributeId === attributeId) {
                newDataSource.application[attributeId] = newAttribute[attributeId]
                break
            }
        }
        this.setState({ dataSource: newDataSource, noRules: noRules})
    };

    onApplicationUpdate = (application) => {
        const newDataSource = {...this.state.dataSource}
        newDataSource.application = {...application.application}
        let newFields = {}
        for (let attributeApplication in attributes.application) {
            let attribute = attributes.application[attributeApplication]
            newFields[attribute.attributeId] = application.application[attributeApplication]
            if(attribute.hasSuffixValue) {
                newFields[attribute.suffixAttributeId] = application.application[attribute.suffixAttributeId]
            }
        }
        this.setState({ dataSource: newDataSource }, () => {
            this.formRef.current.setFieldsValue(newFields)
        })
    }

    onReutilisationUpdate = (reutilization) => {
        const newDataSource = {...this.state.dataSource}
        newDataSource.reutilization = {...reutilization}
        this.setState({ dataSource: newDataSource })
    }

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
            required: "'Ce champ est requis!",
            types: {
                email: "Ce n'est pas un email valide (ie: ____@----.**",
                url: "Ce n'est pas une url valide (ie: http://www.___.**)",
            },
        };
        return (
            <Form onFinish={this.submit} ref={this.formRef} validateMessages={validateMessages} onValuesChange={this.updateDataSourceState}>
                {(this.props.forceEdit || this.props.currentUser.userHasAdminRightsToDatasource(this.state.dataSource)) && (
                    <DataSourceAdminHeader
                      editMode={this.state.editMode}
                      onActivateEdition={(e) => this.activateEdition(e)}
                      onCancelEdition={(e) => this.onCancelEdition(e)}
                      onDelete={(e) => this.showDeleteConfirm(e)}
                      fromCreation={this.props.fromAppCreation || this.props.fromDataSourceCreation}
                    />
                )}
                <DataSourceMainSection
                  noRules={this.state.noRules}
                  allowAppSelection={!this.props.fromAppCreation || !this.props.fromAppModification}
                  editMode={this.state.editMode}
                  dataSource={this.state.dataSource}
                  onChange={this.onApplicationUpdate}
                />
                <DataSourceMetricsSection
                  editMode={this.state.editMode}
                  dataSource={this.state.dataSource}
                />
                <DataSourceReutilisationsSection
                  editMode={this.state.editMode}
                  dataSource={this.state.dataSource}
                  onChange={this.onReutilisationUpdate}
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
