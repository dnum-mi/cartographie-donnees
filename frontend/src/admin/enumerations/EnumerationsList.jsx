import React from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Modal, Upload, Collapse, Skeleton} from 'antd';
import {ExclamationCircleOutlined, DownloadOutlined, UploadOutlined} from '@ant-design/icons';

import {exportEnumerationUrl, importEnumeration, exportModel, getEnumerationCategories} from "../../api";
import Error from "../../components/Error";
import './EnumerationsList.css';
import EnumerationCategory from "./EnumerationCategory";
import {QuestionCircleOutlined} from '@ant-design/icons';
import withTooltips from "../../hoc/tooltips/withTooltips"
import filters from '../../filters';
import attributes from '../../data-source/attributes';

const {confirm} = Modal;
const {Panel} = Collapse;

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
        "Famille": "blue",
        "Organisation": "volcano",
        "Type": "red",
        "Sensibilité": "lime",
        "OpenData": "green",
        "Exposition": "gold",
        "Origine": "geekblue"
      },
      tooltips: {
        "Famille": "Famille fonctionnelle de la donnée",
        "Organisation": "MOA propriétaire de la donnée",
        "Type": "Type de la donnée",
        "Sensibilité": "Sensibilité des données identifiantes",
        "OpenData": "La donnée est-elle publiable en Open Data ?",
        "Exposition": "Type de mises à disposition",
        "Origine": "Origine fonctionnelle de la donnée",
        "Mise à jour": "Fréquence des mises à jour de la donnée",
        "Tag": "Tags de la donnée",
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

  getAttributeKeyFromCategory = (category) =>{
    return !!Object.values(filters).find((item)=>item.categoryName == category)
    ? Object.values(filters).find((item)=>item.categoryName == category).tooltipKey || Object.values(filters).find((item)=>item.categoryName == category).attributeKey
    : Object.values(attributes).find((item)=>item.tagCategory == category).attributeId
  }
  getTooltip = (category) => {
    return this.props.tooltips.get(this.getAttributeKeyFromCategory(category));
  }

  renderCategoryHeader = (categoryName) => (
    <span>
      {categoryName + " "}
      <QuestionCircleOutlined title={this.getTooltip(categoryName)} />
    </span>
  )

  renderContent() {
    if (this.state.loading) {
      return (
        <div>
          <Skeleton loading={true} active>
          </Skeleton>
          <Skeleton loading={true} active>
          </Skeleton>
          <Skeleton loading={true} active>
          </Skeleton>
        </div>
      )
    }
    return (<>
      <Error error={this.state.error}/>
      {
        this.state.categories.map((category) => (
          <Collapse
            key={category}
          >
            <Panel
              key={category}
              header={this.renderCategoryHeader(category)}
              className={this.getColor(category)}
            >
              <EnumerationCategory
                key={category}
                category={category}
                onError={(error) => this.setState({error})}
                onDelete={(categoryToDelete, id) => {
                  this.deleteEnumerationApi(categoryToDelete, id);
                }}
              />
            </Panel>
          </Collapse>
        ))
      }</>);
  }

  uploadfile({onSuccess, onError, file}) {
    confirm({
      title: 'Import des filtres',
      icon: <ExclamationCircleOutlined/>,
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
            <Button onClick={this.export} icon={<UploadOutlined/>} type="default">Export</Button>
            <Upload
              customRequest={this.uploadfile.bind(this)}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<DownloadOutlined/>} type="default">Import</Button>
            </Upload>
          </div>
        </header>
        <p>Afin d'éditer un filtre ou son libellé, il faut double-cliquer sur un des filtres, ou l'un des libellés. Une
          fois la valeur modifiée, il faut confirmer en pressant la touche <i>Entrer</i>.</p>
        <p>Note : Le filtre Famille est utilisé pour les champs famille, référentiel et axes d'analyse.</p>
        {this.renderContent()}
      </div>
    );
  }
}

export default withRouter(withTooltips(EnumerationsList));
