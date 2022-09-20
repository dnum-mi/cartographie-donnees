import React from 'react';
import {withRouter} from 'react-router-dom';
import SettingsHeader from "./SettingsHeader.jsx"
import SettingsHomepageSection from "./SettingsHomepageSection.jsx"
import {Form, Modal, Skeleton} from "antd";
import {updateWildCards, exportWildCardsUrl, exportModel, importWildCards, fetchWildCards} from "../../api";
import {ExclamationCircleOutlined} from '@ant-design/icons';

const {confirm} = Modal;

class SettingsPage extends React.Component {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      editMode:false,
      to_submit:{},
      original_data:{},
      data:{},
      loading: true,
      error: null,
      colors: {
        "Famille": "blue",
        "Organisation": "volcano",
        "Type": "red",
        "Sensibilité": "lime",
        "OpenData": "green",
        "Exposition": "gold",
        "Origine": "geekblue"
      }
    }
  }

  //#region Init
  componentDidMount() {
    this.fetchHomepageFromApi();
  }

  fetchHomepageFromApi = () => {
  this.setState({
      loading: true,
      error: null,
  });

  fetchWildCards("homepage")
      .then((response) => {
          this.props.refreshHomepage(response.data.homepage);
          this.refreshForm(this.props.homepageContent, "homepage")
          this.setState({
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

  //#endregion

  //#region Toolbox 
  // TODO Weird behavior of ant design, I have to use setFieldsValue to update fields, if I want to keep a State, I should just use the values from the form?
  // Should I remove the data state?

  // Use refreshHomepage when we get new homepage data or import data
  refreshForm = (item, namespace, key=null) =>{
    if(key === null){
      for (const [id, value] of Object.entries(item)){  
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
  
  handleFormValuesChange = (changed_values, allValues) =>{
    const [id, value] = Object.entries(changed_values)[0]
    const [namespace,key] = id.split("/")
    this.addChangeToSubmit(value, namespace, key)
  }
  
  // to_submit is a dict to keep only one update
  addChangeToSubmit = (value, namespace, key) =>{
    this.setState({
      to_submit:{
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

  onUploadfile = ({onSuccess, onError, file}) => {
    confirm({
      title: 'Import des paramètres',
      icon: <ExclamationCircleOutlined/>,
      content: <div>
          Vous êtes sur le point de remplacer les paramètres. Cette action est irréversible ! <br/>
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
            this.fetchHomepageFromApi();
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
    this.setState({original_data: {...this.state.data}});
  };

  onCancelEdition = (event) => {
    this.setState({ editMode: false });
    this.setState({data: {...this.state.original_data}});
    this.formRef.current.resetFields();
  };


  submit = (values) => {

    let payload = []
    // Flatten wildcards nested dict to list of dict
    for (const [namespace, dict] of Object.entries(this.state.to_submit  )) {
      for (const [key, value] of Object.entries(dict)) {
        payload.push({namespace, key, value})
      }
    }

    // POST
    updateWildCards(payload);
    
    // update state
    for (const item of payload) {
      this.refreshForm(item.value, item.namespace, item.key)
      this.props.refreshHomepage(item.value, item.key) //update app view
    }

    this.setState({
      editMode: false,
      to_submit:{}
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
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
          onValuesChange={this.handleFormValuesChange}
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

                  {/* <SettingsTooltipsSection
                    editMode={this.state.editMode}
                    dataSource={this.state.dataSource}
                  /> */}
                </div>
          }
        </Form>
      </div>
    );
  }
}

export default withRouter(SettingsPage);
