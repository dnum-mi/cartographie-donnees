import React from 'react';
import PropTypes from "prop-types";
import { withRouter } from 'react-router-dom';
import {Form, Modal, notification} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import {createDataSource, deleteDataSource} from '../api';
import DataSourceAdminHeader from './DataSourceAdminHeader';
import DataSourceMainSection from './DataSourceMainSection';

import './DataSourcePage.css';
import DataSourceMetricsSection from "./DataSourceMetricsSection";
import DataSourceReutilisationsSection from "./DataSourceReutilizationsSection";
import withCurrentUser from "../hoc/user/withCurrentUser";
import attributes from './attributes';

const { confirm } = Modal;

class DataSourcePage extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            dataSource: Object.assign({}, this.props.dataSource),
            editMode: this.props.location?.state?.forceEdit || props.forceEdit,
            noRules: this.props.fromAppCreation || this.props.fromAppModification
        }
    }

    componentDidMount() {
        this.props.history.replace({ state: {} });
    }

    handleDelete = (event) => {
        if (this.props.handleDelete) {
            this.props.handleDelete();
        } else {
            this.showDeleteConfirm();
        }
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

    onReutilisationsUpdate = (reutilizations) => {
        const newDataSource = {...this.state.dataSource}
        newDataSource.reutilizations = [...reutilizations]
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

    handleDuplication = (event) => {
        if (this.props.handleDuplication) {
            this.props.handleDuplication();
        } else {
            this.duplicateDataSource();
        }
    }

    duplicateDataSource = () => {
        let dataSource = this.state.dataSource;
        dataSource.name = dataSource.name + " (Copie)";
        delete dataSource.id;
        createDataSource(
            dataSource,
        ).then((results) => {
            this.props.history.push("/data-source/" + results.data.id, {forceEdit: true})
        }).catch((error) => {
            notification.error({
                message: `Une erreur est survenue`,
                description:
                    "La fiche n'a pas pu être dupliquée.",
                placement: 'bottomRight'
            });
        })
    }

    renderContent() {
        const validateMessages = {
            required: "Ce champ est requis !",
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
                      onDelete={(e) => this.handleDelete(e)}
                      onDuplicate={(e) => this.handleDuplication(e)}
                      fromCreation={this.props.fromAppCreation || this.props.fromDataSourceCreation}
                      fromAppModification={this.props.fromAppModification}
                      dataSource={this.props.dataSource}
                    />
                )}
                <DataSourceMainSection
                  noRules={this.state.noRules}
                  allowAppSelection={!this.props.fromAppCreation && !this.props.fromAppModification}
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
                  onChange={this.onReutilisationsUpdate}
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

DataSourcePage.propTypes = {
    dataSource: PropTypes.object,
    handleSubmit: PropTypes.func,
    handleDelete: PropTypes.func,
    handleDuplication: PropTypes.func,
    forceEdit: PropTypes.bool,
    fromAppCreation: PropTypes.bool,
    fromAppModification: PropTypes.bool,
    fromDataSourceCreation: PropTypes.bool,
}

DataSourcePage.defaultProps = {
    forceEdit: false,
    fromAppCreation: false,
    fromAppModification: false,
    fromDataSourceCreation: false,
}

export default withRouter(withCurrentUser(DataSourcePage));
