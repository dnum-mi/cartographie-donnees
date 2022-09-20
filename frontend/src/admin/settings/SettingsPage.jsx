import React from 'react';
import {withRouter} from 'react-router-dom';
import SettingsHeader from "./SettingsHeader.jsx"
import SettingsHomepageSection from "./SettingsHomepageSection.jsx"
import {Form} from "antd";
import {updateWildCards} from "../../api";
import { checkPropTypes } from 'prop-types';


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

  activateEdition = (event) => {
    this.setState({ editMode: true });
    this.setState({original_data: {...this.state.data}});
  };

  onCancelEdition = (event) => {
    this.setState({ editMode: false });
    this.setState({data: {...this.state.original_data}});
    this.formRef.current.resetFields();
  };
  
  updateData = (value, namespace, key=null) =>{
    if(key === null){
      this.setState({
        data: {
          [namespace]: value 
        }
      })
    } else {
      this.setState({
        data: {
          ...this.state.data,
          [namespace]: {
            ...this.state.data[namespace],
            [key]:value
          } 
        }
      })
    }
  }

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


  handleFormValuesChange = (changed_values, allValues) =>{
    const [id, value] = Object.entries(changed_values)[0]
    const [namespace,key] = id.split("/")
    this.addChangeToSubmit(value, namespace, key)
  }


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
      this.updateData(item.value, item.namespace, item.key)
      this.props.refreshHomepage(item.key, item.value)
    }

    this.setState({
      editMode: false,
      to_submit:{}
    })
  }


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
          />
          <div className='ConfigSection'>
            <SettingsHomepageSection
                editMode={this.state.editMode}
                data={this.state.data}
                updateData = {this.updateData}
                addChangeToSubmit = {this.addChangeToSubmit}
              />

            {/* <SettingsTooltipsSection
              editMode={this.state.editMode}
              dataSource={this.state.dataSource}
            /> */}
          </div>
        </Form>
      </div>
    );
  }
}

export default withRouter(SettingsPage);
