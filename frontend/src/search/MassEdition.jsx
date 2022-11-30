import React from "react";
import {Button, Divider, Form, Select, Tag} from "antd";
import {CheckOutlined} from "@ant-design/icons";
import "./MassEdition.css"
import {defaultLabels} from "../hoc/tooltips/tooltipsConstants";
import MassEditionValueSelect from "./MassEditionValueSelect";
import {massEditDataSource} from "../api";

const {CheckableTag} = Tag;
const LABELS = {
    ...defaultLabels,
    "application": "Application",
    "reutilizations": "Réutilisations",
    "organization_name": "Organisation"
}
const EDITABLE_ID = ["family_name", "analysis_axis_name", "type_name", "is_reference", "origin_name", "origin_applications", "open_data_name", "exposition_name", "sensibility_name", "tag_name", "update_frequency_name", "application", "organization_name", "reutilizations"]

// TODO disable submit when no datasource selected
// TODO add rules to selectVAlues, required based on attributes.js

class MassEdition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMassEditionField: null,
        }
    }

    formRef = React.createRef();


    onSelectField = (fieldId) => {
        this.setState({selectedMassEditionField: fieldId})
        this.formRef.current.resetFields(["massEditionValues"])
    }


    onSubmitMassEdition = (form_values) => {
        console.log("submit mass edition")
        console.log("modif", form_values)
        console.log("datasources", this.props.selectedDatasources)

        const key = form_values["massEditionField"]
        const value = form_values["massEditionValues"]
        massEditDataSource(
            Object.keys(this.props.selectedDatasources).map(Number),
            key === "organization_name"
                ? "application"
                : "datasource",
            key,
            value
        ).then((res) => {
            console.log(res)
        })
    }


    render() {
        const options_attributes_id = EDITABLE_ID.map((item) => {
            return {
                label: LABELS[item], value: item
            }
        })

        return (
            <div className={"mass-edition"}>
                <CheckableTag checked={this.props.showEditionSection}
                              onChange={this.props.onShowModificationSection}>
                    Modifier les données
                </CheckableTag>
                {this.props.showEditionSection &&
                    <div>
                        <Divider/>
                        <Form name="massEditionForm"
                              ref={this.formRef}
                              className={"mass-edition-form"}
                              onFinish={this.onSubmitMassEdition}>
                            <Form.Item name="massEditionField"
                                       rules={[
                                           {
                                               required: true,
                                               message: 'Merci de renseigner le champ à modifier',
                                           },
                                       ]}>
                                <Select options={options_attributes_id}
                                        onSelect={this.onSelectField}
                                        placeholder="Champ à modifier"/>
                            </Form.Item>
                            <MassEditionValueSelect selectedMassEditionField={this.state.selectedMassEditionField}/>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<CheckOutlined/>}>
                                Valider les modifications
                            </Button>
                        </Form>
                        <p>
                            Données sélectionnées: {Object.keys(this.props.selectedDatasources).length}
                            <CheckableTag
                                checked={Object.keys(this.props.selectedDatasources).length === this.props.totalCount}
                                onChange={this.props.onCheckUncheckAll}>
                                {Object.keys(this.props.selectedDatasources).length === this.props.totalCount
                                    ? "Tout décocher"
                                    : "Tout cocher"}
                            </CheckableTag>
                        </p>
                    </div>
                }
            </div>
        )
    }
}

export default MassEdition;
