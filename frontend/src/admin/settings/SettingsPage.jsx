import React from 'react';
import { withRouter } from 'react-router-dom';
import SettingsHeader from "./SettingsHeader.jsx"
import SettingsHomepageSection from "./SettingsHomepageSection.jsx"
import { Form, Modal, Skeleton } from "antd";
import { updateWildCards, exportWildCardsUrl, exportModel, importWildCards, fetchWildCards } from "../../api";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import withTooltips from '../../hoc/tooltips/withTooltips.jsx';
import SettingsTooltipsSection from './SettingsTooltipsSection.jsx';
import { defaultLabels } from '../../hoc/tooltips/tooltipsConstants.js';

const { confirm } = Modal;

class SettingsPage extends React.Component {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      to_submit: {},
      loading: true,
      error: null,
    }
  }

  //#region Init
  componentDidMount() {
    this.refreshSettings();
  }

  // refreshTooltips = (tp) => {
  //   for (const [id,value] of Object.entries(tp)){
  //     this.props.tooltips.update({ [id]: value }) // update 
  //   }
  // }

  refreshSettings = () => {
    this.setState({
      loading: true,
    });

    fetchWildCards("tooltips")
      .then((response) => {
        this.props.tooltips.refresh(response.data.tooltips)
        this.refreshForm(response.data.tooltips, "tooltips")
      })
      .then(() => fetchWildCards("homepage"))
      .then((response) => {
        this.props.updateHomepage(response.data.homepage);
        this.refreshForm(this.props.homepageContent, "homepage")
      })
      .then(this.setState({
        loading: false,
        error: null,
      }))
      .catch((error) => {
        this.setState({
          loading: false,
          error,
        });
      });
  };

  //#endregion

  //#region Toolbox 

  // Update current form values with new incoming values
  updateForm = (item, namespace, key = null) => {
    if (key === null) {
      for (const [id, value] of Object.entries(item)) {
        this.formRef.current.setFieldsValue({
          [`${namespace}/${id}`]: value
        });
      }

    } else {
      this.formRef.current.setFieldsValue({
        [`${namespace}/${key}`]: item
      });
    }
  }

  // Refresh entire form with new values
  refreshForm = (item, namespace) => {
    if (namespace == "homepage") {
      for (const id of ["app_title", "welcome_title", "welcome_text", "email"]) {
        this.formRef.current.setFieldsValue({
          [`homepage/${id}`]: item[id] ? item[id] : ""
        });
      }
    }
    if (namespace == "tooltips") {
      for (const id of Object.keys(defaultLabels)) {
        this.formRef.current.setFieldsValue({
          [`tooltips/${id}`]: item[id] ? item[id] : ""
        });
      }
    }
  }

  handleFormValuesChange = (changed_values, allValues) => {
    const [id, value] = Object.entries(changed_values)[0]
    const splitted = id.split("/")
    const namespace = splitted[0]
    const key = splitted[1]
    this.addChangeToSubmit(value, namespace, key)
  }

  // to_submit is a dict to keep only one update
  addChangeToSubmit = (value, namespace, key) => {
    this.setState({
      to_submit: {
        ...this.state.to_submit,
        [namespace]: {
          ...this.state.to_submit[namespace],
          [key]: value
        }
      }
    })
  }

  //#endregion

  //#region Button behaviours
  onExport = () => {
    exportModel(exportWildCardsUrl, "Parametres.csv");
  }

  onUploadfile = ({ onSuccess, onError, file }) => {
    confirm({
      title: 'Import des paramètres',
      icon: <ExclamationCircleOutlined />,
      content: <div>
        Vous êtes sur le point de remplacer les paramètres. Cette action est irréversible ! <br />
        Vous pouvez comparer votre fichier avec la base actuelle en téléchargeant le fichier CSV à l'aide du bouton d'export."
      </div>,
      onOk: () => {
        this.setState({
          loading: true,
          error: null,
        })
        const formData = new FormData();
        formData.append("file", file);
        importWildCards(formData)
          .then(() => {
            onSuccess(null, file);
            this.refreshSettings();
          })
          .catch((error) => {
            this.setState({
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


  activateEdition = (event) => {
    this.setState({ editMode: true });
  };

  onCancelEdition = (event) => {
    this.setState({ editMode: false });
    this.formRef.current.resetFields();
  };


  submit = (values) => {
    let payload = []
    // Flatten wildcards nested dict to list of dict
    for (const [namespace, dict] of Object.entries(this.state.to_submit)) {
      for (const [key, value] of Object.entries(dict)) {
        payload.push({ namespace, key, value })
      }
    }

    // POST
    updateWildCards(payload);

    // update state with returned values
    for (const item of payload) {
      this.updateForm(item.value, item.namespace, item.key)
      if (item.namespace === "homepage") {
        this.props.updateHomepage(item.value, item.key) //update app view
      }
      if (item.namespace === "tooltips") {
        this.props.tooltips.update({ [item.key]: item.value }) // update 
      }
    }

    this.setState({
      editMode: false,
      to_submit: {}
    })
  }

  //#endregion

  render() {
    const validateMessages = {
      required: "'Ce champ est requis!",
      types: {
        email: "Ce n'est pas un email valide (ie: ____@----.**",
        url: "Ce n'est pas une url valide (ie: http://www.___.**)",
      },
    };

    return (
      <div className="SettingsPage">

        <h1>
          Liste des paramètres
        </h1>

        <Form
          onFinish={this.submit}
          ref={this.formRef}
          validateMessages={validateMessages}
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 12 }}
          autoComplete="off"
          onValuesChange={this.handleFormValuesChange}
          labelWrap
        // layout="vertical" 
        >

          <SettingsHeader
            editMode={this.state.editMode}
            onActivateEdition={(e) => this.activateEdition(e)}
            onCancelEdition={(e) => this.onCancelEdition(e)}
            onExport={this.onExport}
            onUploadfile={this.onUploadfile}
          />
          {
            (this.state.loading)
              ? <div>
                <Skeleton loading={true} active>
                </Skeleton>
              </div>
              : <div className='ConfigSection'>
                <SettingsHomepageSection
                  editMode={this.state.editMode}
                  homepageContent={this.props.homepageContent}
                />
                <SettingsTooltipsSection
                  editMode={this.state.editMode}
                  tooltips={this.props.tooltips}
                />
              </div>
          }
        </Form>
      </div>
    );
  }
}

export default withRouter(withTooltips(SettingsPage));
