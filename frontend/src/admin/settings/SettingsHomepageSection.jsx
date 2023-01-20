import React from 'react';
import {Form, Input} from "antd";

import './SettingsHomepageSection.css';

const { TextArea } = Input;

class SettingsHomepageSection extends React.Component {

    constructor(props) {
        super(props);
    }


    createTextArea(key, label){
        return (
        <Form.Item 
            name ={`homepage/${key}`} 
            initialValue={this.props.homepageContent[key] || ""} 
            label={label}>
                <TextArea
                disabled={!this.props.editMode} 
                autoSize
                />
        </Form.Item>
        );
    }

    render() {
        return (
            <div className="SettingsHomepageSection">
                <h2>Page d'accueil</h2>
                    <div> 
                        {this.createTextArea("app_title", "Titre de l’application")}
                        {this.createTextArea("welcome_title", "Titre d'accueil")}
                        {this.createTextArea("welcome_text", "Texte d'accueil")}
                        <Form.Item 
                        name ="homepage/welcome_email"
                        label="Adresse mail de contact"
                        initialValue={this.props.homepageContent["welcome_email"]}
                        rules={[{type: 'email'}]}>
                            <Input 
                            disabled={!this.props.editMode} 
                            />
                        </Form.Item>
                    </div>
            </div>
        );
    }
}

export default SettingsHomepageSection;
