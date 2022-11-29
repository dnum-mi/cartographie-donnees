import React from "react";
import {Button, Divider, Form, Select, Tag} from "antd";
import {CheckOutlined} from "@ant-design/icons";
import "./MassEdition.css"
import {defaultLabels} from "../hoc/tooltips/tooltipsConstants";
import MassEditionValueSelect from "./MassEditionValueSelect";

const {CheckableTag} = Tag;
const LABELS = {
    ...defaultLabels,
    "application": "Application",
    "reutilizations": "Réutilisations",
    "organization_name": "Organisation"
}
const EDITABLE_ID = ["family_name", "analysis_axis_name", "type_name", "is_reference", "origin_name", "origin_applications", "open_data_name", "exposition_name", "sensibility_name", "tag_name", "application", "organization_name", "reutilizations"]

class MassEdition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModificationSection: false,
            selectedMassEditionField: null,
        }
    }

    formRef = React.createRef();

    onShowModificationSection = (checked) => {
        this.setState({showModificationSection: checked})
    }

    onSelectField = (fieldId) => {
        this.setState({selectedMassEditionField: fieldId})
        this.formRef.current.resetFields(["massEditionValues"])
    }


    // check onApplicationUpdate

    onSubmitMassEdition = (values) => {
        console.log(values)
    }

    render() {
        const options_attributes_id = EDITABLE_ID.map((item) => {
            return {
                label: LABELS[item], value: item
            }
        })

        return (
            <div className={"mass-edition"}>
                <CheckableTag checked={this.state.showModificationSection}
                              onChange={this.onShowModificationSection}>
                    Modifier les données
                </CheckableTag>
                {this.state.showModificationSection &&
                    <div>
                        <Divider/>
                        <Form name="massEditionForm"
                              ref = {this.formRef}
                              className={"mass-edition-form"}
                              onFinish={this.onSubmitMassEdition}>
                            <Form.Item name="massEditionField">
                                <Select options={options_attributes_id}
                                        onSelect={this.onSelectField}
                                        placeholder="Champ à modifier"/>
                            </Form.Item>
                            <MassEditionValueSelect selectedMassEditionField={this.state.selectedMassEditionField}/>
                            <Button type="primary" htmlType="submit" icon={<CheckOutlined/>}>
                                Valider les modifications
                            </Button>
                        </Form>
                        <p>
                            Données sélectionnées: TBD
                            <Button>Tout cocher</Button>
                        </p>
                    </div>
                }
            </div>
        )
    }
}

export default MassEdition;
