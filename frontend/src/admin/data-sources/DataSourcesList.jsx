import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import {Button, Pagination, Modal, Upload, Skeleton} from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';

import { fetchDataSources, exportDataSourceUrl, importDataSource, exportModel } from "../../api";
import Loading from "../../components/Loading";
import Error from "../../components/Error";
import './DataSourcesList.css';
import DataSourceResult from "../../search/results/DataSourceResult";
import Warning from "../../components/Warning";

const { confirm } = Modal;

class DataSourcesList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            total_count: 1,
            page: 1,
            count: 50,
            dataSources: [],
            warning: null
        }
    }

    componentDidMount() {
        this.fetchDataSourcesFromApi();
    }

    fetchDataSourcesFromApi() {
        this.setState({
            loading: true,
            error: null,
        });
        fetchDataSources(this.state.page, this.state.count)
            .then((response) => {
                this.setState({
                    dataSources: response.data.results,
                    loading: false,
                    error: null,
                    total_count: response.data.total_count,
                });
            })
            .catch((error) => {
                this.setState({
                    dataSources: [],
                    loading: false,
                    error,
                });
            });
    }

    onChange(page, count) {
        this.setState({
            page: page,
            count: count,
        }, this.fetchDataSourcesFromApi);
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
            // return <Loading />;
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
                                                   inputType={"data_source"}/>
                }
                {
                    this.state.dataSources.map((dataSource) => (
                        <DataSourceResult
                            key={dataSource.id}
                            dataSource={dataSource}
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
            title: 'Import des données',
            icon: <ExclamationCircleOutlined />,
            content: "Vous êtes sur le point de remplacer la base de données. Cette action est irréversible ! \
            Vous pouvez comparer votre fichier avec la base actuelle en téléchargeant le fichier CSV à l'aide du bouton\
            d'export. Vérifiez que vous avez bien importé les applications et les énumérations nécessaires.",
                onOk: () => {
                    this.setState({
                        loading: true,
                        error: null,
                    });
                    const formData = new FormData();
                    formData.append("file", file);
                    importDataSource(formData)
                    .then((r) => {
                        this.checkForWarningMessage(r)
                        onSuccess(null, file);
                        this.props.count();
                        this.fetchDataSourcesFromApi();
                    })
                    .catch((error) => {
                        this.setState({
                            dataSources: [],
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
       exportModel(exportDataSourceUrl, 'Donnees.csv');
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
            <div className="DataSourcesList">
                <h1>
                    Liste des données
                </h1>
                <div className="actions">
                    <Link to={"/data-source/create"}>
                        <Button type="primary" icon={<PlusOutlined />}>
                            Créer une donnée
                        </Button>
                    </Link>
                    {this.props.user.is_admin && (<Button onClick={this.export} icon={<DownloadOutlined />} type="default">Export</Button>)}
                    {this.props.user.is_admin && (<Upload
                        customRequest={this.uploadfile.bind(this)}
                        maxCount={1}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />} type="default">Import</Button>
                    </Upload>)}
                </div>
                {this.renderPagination()}
                <br/>
                {this.renderContent()}
                {this.renderPagination()}
            </div>
        );
    }
}

export default withRouter(DataSourcesList);
