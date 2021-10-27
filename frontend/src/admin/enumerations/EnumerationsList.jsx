import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Input, Modal, Upload, Collapse } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';

import { exportEnumerationUrl, importEnumeration, exportModel, getEnumerationCategories } from "../../api";
import Loading from "../../components/Loading";
import Error from "../../components/Error";
import './EnumerationsList.css';
import EnumerationCategory from "./EnumerationCategory";
import { QuestionCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const { Panel } = Collapse;

class EnumerationsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            newCategoryName: '',
            newCategoryInputKey: Math.random(),
            categories: [],
            colors: {
                "Famille" : "blue",
                "Organisation" : "volcano",
                "Type" : "red",
                "Sensibilité" : "lime",
                "OpenData" : "green",
                "Exposition" : "gold",
                "Origine" : "geekblue"
            },
            tooltips: {
                "Famille" : "Famille fonctionnelle de la donnée",
                "Organisation" : "MOA propriétaire de la donnée",
                "Type" : "Type de la donnée",
                "Sensibilité" : "Sensibilité des données identifiantes",
                "OpenData" : "La donnée est-elle publiable en Open Data ?",
                "Exposition" : "Type de mises à disposition",
                "Origine" : "Origine fonctionnelle de la donnée",
                "Mise à jour" : "Fréquence des mises à jour de la donnée",
                "Tag" : "Tags de la donnée",
            }
        }
    }

    componentDidMount() {
        this.fetchEnumerationsFromApi();
    }

    fetchEnumerationsFromApi = () => {
        this.setState({
            loading: true,
            error: null,
        });
        getEnumerationCategories()
            .then((response) => {
                this.setState({
                    categories: response.data,
                    loading: false,
                    error: null,
                });
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error,
                });
            });
    };

    createCategory = () => {
        if (this.state.newCategoryName && this.state.newCategoryName.length) {
            this.setState({
                categories: {
                    ...this.state.categories,
                    [this.state.newCategoryName]: [],
                },
                newCategoryName: '',
                newCategoryInputKey: Math.random(),
            });
        }
    }

   getColor = (category) => {
        return this.state.colors[category];
    }

   getTooltip = (category) => {
        return this.state.tooltips[category];
    }

    renderContent() {
        if (this.state.loading) {
            return <Loading />;
        }
        return (<>
            {this.state.error ? <Error error={this.state.error}/> : null}
            {
                this.state.categories.map((x) => (
                <Collapse>
                    <Panel key={x} header={<span>{x+" "}<QuestionCircleOutlined title={this.getTooltip(x)}/></span>} className={this.getColor(x)}>
                        <EnumerationCategory
                            key={x}
                            category={x}
                            error = {(error) => this.setState({error})}
                            onDelete={(category, id) => {
                                this.deleteEnumerationApi(category, id);

                                }}
                        />
                     </Panel>
                </Collapse>
                ))
            }</>);
    }

      uploadfile({ onSuccess, onError, file }) {
            confirm({
            title: 'Import des filtes',
            icon: <ExclamationCircleOutlined />,
            content: "Vous êtes sur le point de remplacer les filtres. Cette action est irréversible ! \
            Il ne doit pas y avoir d'application ou de données car ces deux tables sont liées aux filtres\
            Vous pouvez comparer votre fichier avec la base actuelle en téléchargeant le fichier CSV à l'aide du bouton\
            d'export.",
                onOk: () => {
                    this.setState({
                        loading: true,
                        error: null,
                    })
                    const formData = new FormData();
                    formData.append("file", file);
                    importEnumeration(formData)
                    .then(() => {
                        onSuccess(null, file);
                        this.fetchEnumerationsFromApi();
                    })
                    .catch((error) => {
                        this.setState({
                            applications: [],
                            loading: false,
                            error,
                        })
                    });
                },
                onCancel() {
                    console.log('Cancel');
                },
            });
        };

    export = () => {
        exportModel(exportEnumerationUrl, 'Filtres.csv');
    }

    render() {
        return (
            <div className="EnumerationsList">
                <header>
                    <h1>
                        Liste des filtres
                    </h1>

                    <div className="actions">
                        <Button onClick={this.export} icon={<DownloadOutlined />} type="default">Export</Button>
                        <Upload
                            customRequest={this.uploadfile.bind(this)}
                            maxCount={1}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} type="default">Import</Button>
                        </Upload>
                    </div>
                </header>
                <p>Afin d'éditer un filtre, il faut double-cliquer sur un des filtres. Une fois le filtre modifié, il faut confirmer en pressant la touche <i>Entrer</i>.</p>
                <p>Note : Le filtre Famille est utilisé pour les champs famille, référentiel et axes d'analyse.</p>
                {this.renderContent()}
            </div>
        );
    }
}

export default withRouter(EnumerationsList);
