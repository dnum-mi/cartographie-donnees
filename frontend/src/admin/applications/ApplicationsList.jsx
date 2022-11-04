import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import {Button, Pagination, Modal, Upload, Skeleton} from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';

import { fetchApplications, exportApplicationUrl, importApplication, exportModel } from "../../api";
import Loading from "../../components/Loading";
import Error from "../../components/Error";
import './ApplicationsList.css';
import ApplicationResult from "../../search/results/ApplicationResult";
import Warning from "../../components/Warning";

const { confirm } = Modal;

class ApplicationsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            total_count: 1,
            page: 1,
            count: 50,
            applications: [],
            warning: null
        }
    }

    componentDidMount() {
        this.fetchApplicationsFromApi();
    }

    fetchApplicationsFromApi() {
        this.setState({
            loading: true,
            error: null,
        });

        fetchApplications(this.state.page, this.state.count)
            .then((response) => {
                this.setState({
                    applications: response.data.results,
                    loading: false,
                    error: null,
                    total_count: response.data.total_count,
                });
            })
            .catch((error) => {
                this.setState({
                    applications: [],
                    loading: false,
                    error,
                });
            });
    }

    onChange(page, count) {
        this.setState({
            page: page,
            count: count,
        }, this.fetchApplicationsFromApi);
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
        return (
            <>
                {
                    this.state.warning && <Warning description={this.state.warning.description}
                                                   message={this.state.warning.message}
                                                   warningType={this.state.warning.warningType}
                                                   inputType={"application"}/>
                }
                {
                    this.state.applications.map((application) => (
                        <ApplicationResult
                            key={application.id}
                            application={application}
                        />
                    ))
                }
            </>
        )
    }

    renderPagination() {
        return (
            <Pagination
                showSizeChanger
                current={this.state.page}
                pageSize={this.state.count}
                total={this.state.total_count}
                onChange={this.onChange.bind(this)}
            />
        )
    }

      uploadfile({ onSuccess, onError, file }) {
        confirm({
            title: 'Import des applications',
            icon: <ExclamationCircleOutlined />,
            content: "Vous êtes sur le point de remplacer la base de données. Cette action est irréversible ! \
            Il ne doit pas y avoir de données car elles sont liées aux applications\
            Vous pouvez comparer votre fichier avec la base actuelle en téléchargeant le fichier CSV à l'aide du bouton\
            d'export. Vérifiez que vous avez bien importé les énumérations nécessaires.",
                onOk: () => {
                    this.setState({
                        loading: true,
                        error: null,
                    });
                    const formData = new FormData();
                    formData.append("file", file);
                    importApplication(formData)
                    .then((r) => {
                        this.checkForWarningMessage(r)
                        onSuccess(null, file);
                        this.props.count();
                        this.fetchApplicationsFromApi();
                    })
                    .catch((error) => {
                        this.setState({
                            applications: [],
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
        exportModel(exportApplicationUrl, "Applications.csv");
    }

    checkForWarningMessage = (r) => {
        if(r.data.warning_type){
            this.setState({
                warning:
                    {
                        description: r.data.description,
                        message: r.data.message,
                        warningType: r.data.warning_type
                    }
            })
        }
        else {
            this.setState({warning: null})
        }
    }

    render() {
        return (
            <div className="ApplicationsList">
                <h1>
                    Liste des applications
                </h1>
                {this.props.user.is_admin && (
                <div className="actions">
                    <Link to={'/application/create'}>
                        <Button type="primary" icon={<PlusOutlined />}>
                            Créer une application
                        </Button>
                    </Link>
                    <Button onClick={this.export} icon={<DownloadOutlined />} type="default">Export</Button>
                    <Upload
                        customRequest={this.uploadfile.bind(this)}
                        maxCount={1}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />} type="default">Import</Button>
                    </Upload>
                </div>
                )}
                {this.renderPagination()}
                <br/>
                {this.renderContent()}
                {this.renderPagination()}
            </div>
        );
    }
}

export default withRouter(ApplicationsList);
