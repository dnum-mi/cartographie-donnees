import React from 'react';
import {Divider, Form, Input} from "antd";

import './SettingsSynonymsSection.css';

const { TextArea } = Input;

class SettingsSynonymsSection extends React.Component {

    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div className="SettingsSynonymsSection">
                <h2>Synonymes de recherche</h2>
                <p>Veuillez insérer les synonymes sur une ligne, séparés par une virgule.</p>
                <Divider />
                    <div>
                        <Form.Item
                            labelCol={{ span: 0 }}
                            wrapperCol={{ span: 0 }}
                            key={'synonyme/synonyme'}
                            name={'synonyme/synonyme'}
                            initialValue={this.props.synonymsContent || ""}
                        >
                            <TextArea
                                disabled={!this.props.editMode}
                                autoSize
                            />
                        </Form.Item>
                    </div>
            </div>
        );
    }
}

export default SettingsSynonymsSection;
