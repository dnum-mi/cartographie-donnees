import React from 'react';
import { Col, Row, Button, Form, Input, Skeleton} from "antd";
import {fetchWildCards} from "../../api";

import './SettingsHomepageSection.css';


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

    handleChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.props.updateData(value,'homepage',name)
        this.props.addChangeToSubmit(value,'homepage',name)
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
                        <Form.Item label="Texte de la page d'accueil">
                            <Input name ="text" disabled={!this.props.editMode} value={this.props.data["homepage"]["text"]} onChange={this.handleChange}/>
                        </Form.Item>
                        <Form.Item label="Adresse mail de contact">
                            <Input name ="email" disabled={!this.props.editMode} value={this.props.data["homepage"]["email"]} onChange={this.handleChange}/>
                        </Form.Item>
                    </div>
                }
            </div>
        );
    }
}

export default SettingsHomepageSection;
