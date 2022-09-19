import React from 'react';
import { Col, Row, Button, Form, Input, Skeleton} from "antd";
import {fetchWildCards} from "../../api";

import './SettingsHomepageSection.css';

const { TextArea } = Input;

class SettingsHomepageSection extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null
        }
    }

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
            this.props.updateData(response.data.homepage, "homepage");
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


    createTextArea(key, label){
        return (
        <Form.Item 
            name ={`homepage/${key}`} 
            initialValue={this.props.data["homepage"][key]} 
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
                {
                    (this.state.loading)
                    ? <div>
                        <Skeleton loading={true} active>
                        </Skeleton>
                    </div>
                    : <div> 
                        {this.createTextArea("app_title", "Titre de l’application")}
                        {this.createTextArea("welcome_title", "Titre d'accueil")}
                        {this.createTextArea("welcome_text", "Texte d'accueil")}
                        <Form.Item 
                        name ="homepage/email" 
                        label="Adresse mail de contact"
                        initialValue={this.props.data["homepage"]["email"]} 
                        rules={[{type: 'email'}]}>
                            <Input 
                            disabled={!this.props.editMode} 
                            />
                        </Form.Item>
                    </div>
                }
            </div>
        );
    }
}

export default SettingsHomepageSection;
