import React from 'react';
import { Col, Row, Button, Form, Input } from "antd";
import { defaultLabels } from '../../hoc/tooltips/defaultTooltips';

import './SettingsTooltipsSection.css';

const { TextArea } = Input;

class SettingsTooltipsSection extends React.Component {

    constructor(props) {
        super(props);
    }


    createTextArea = (key, label) => {
        return (
            <Form.Item
                key = {`tooltips/${key}`} 
                name={`tooltips/${key}`}
                initialValue={this.props.tooltips.get(key)}
                label={label || key}>
                <TextArea
                    disabled={!this.props.editMode}
                    autoSize
                />
            </Form.Item>
        );
    }

    tooltipsInput = () => {
        let inputList = [];
        for (const [key, value] of Object.entries(defaultLabels)) {
            inputList.push(this.createTextArea(key, value));
        }
        return inputList;
    }

    render() {
        return (
            <div className="SettingsTooltipsSection">
                <h2>Tooltips</h2>
                <div>
                    {this.tooltipsInput()}
                </div>
            </div>
        );
    }
}

export default SettingsTooltipsSection;
