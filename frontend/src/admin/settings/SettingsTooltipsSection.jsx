import React from 'react';
import { Form, Input, Collapse } from "antd";
import { defaultLabels, applicationKeys, datasourceKeys, otherKeys } from '../../hoc/tooltips/tooltipsConstants';

import './SettingsTooltipsSection.css';

const { TextArea } = Input;
const { Panel } = Collapse;

class SettingsTooltipsSection extends React.Component {

    constructor(props) {
        super(props);
    }

    sort_by_label = (key_a, key_b) => {
        if (!!defaultLabels[key_a] && !!defaultLabels[key_b]) {
            return defaultLabels[key_a].localeCompare(defaultLabels[key_b])
        } else {
            return false
        }
    }

    createTextArea = (key, label) => {
        return (
            <Form.Item
                key={`tooltips/${key}`}
                name={`tooltips/${key}`}
                initialValue={this.props.tooltips.get(key)}
                label={label || undefined}>
                <TextArea
                    disabled={!this.props.editMode}
                    autoSize
                />
            </Form.Item>
        );
    }

    tooltipsInput = (unsorted_key_list) => {
        let key_list = unsorted_key_list.sort(this.sort_by_label)
        let inputList = [];
        for (const key of key_list) {
            if (!!defaultLabels[key]) {
                inputList.push(this.createTextArea(key, defaultLabels[key]))
            }
        }
        return inputList;
    }

    render() {
        return (
            <div className="SettingsTooltipsSection">
                <h2>Tooltips</h2>
                <Collapse ghost>
                    <Panel header="Application" key="Panel_Applications">
                        {this.tooltipsInput(applicationKeys)}
                    </Panel>
                    <Panel header="Donnée" key="Panel_Datasources">
                        {this.tooltipsInput(datasourceKeys)}
                    </Panel>
                    <Panel header="Autre" key="Panel_Other">
                        {this.tooltipsInput(otherKeys)}
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

export default SettingsTooltipsSection;
