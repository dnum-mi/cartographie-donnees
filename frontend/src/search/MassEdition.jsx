import React from "react";
import {Alert, Button, Divider, Form, Select, Tag} from "antd";
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
const EDITABLE_ID = ["family_name", "organization_name", "application", "type_name", "is_reference", "sensibility_name", "open_data_name", "exposition_name", "origin_name", "analysis_axis_name", "tag_name", "origin_applications", "reutilizations"]


class MassEdition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMassEditionField: null,
        }
    }

    formRef = React.createRef();

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.showEditionSection !== this.props.showEditionSection){
            this.setState({selectedMassEditionField: null})
        }
    }

    onSelectField = (fieldId) => {
        this.setState({selectedMassEditionField: fieldId})
        this.formRef.current.resetFields(["massEditionValues", "massEditionAddOrRemove"])
    }


    render() {
        const options_attributes_id = EDITABLE_ID.map((item) => {
            return {
                label: LABELS[item], value: item
            }
        })

        return (
            <div className={"mass-edition"}>
                <CheckableTag
                    checked={this.props.showEditionSection}
                    onChange={this.props.onShowModificationSection}>
                    {this.props.showEditionSection
                        ? "Fermer modification"
                        : "Modifier les données"
                    }
                </CheckableTag>
                {this.props.showEditionSection &&
                    <div>
                        <Divider/>

                        <Form name="massEditionForm"
                              ref={this.formRef}
                              className={"mass-edition-form"}
                              onFinish={this.props.onSubmitMassEdition}>
                            <Form.Item name="massEditionField"
                                       className={"field-select"}
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
                            <MassEditionValueSelect
                                selectedMassEditionField={this.state.selectedMassEditionField}/>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={"submit-button"}
                                icon={<CheckOutlined/>}
                                loading={this.props.loading}
                                disabled={Object.keys(this.props.selectedDatasources).length === 0 || !this.state.selectedMassEditionField}>
                                Valider les modifications
                            </Button>
                        </Form>
                        <div>
                            <CheckableTag
                                checked={Object.keys(this.props.selectedDatasources).length === this.props.totalCount}
                                onChange={this.props.onCheckUncheckAll}>
                                {Object.keys(this.props.selectedDatasources).length !== this.props.totalCount || this.props.totalCount === 0
                                    ? "Tout cocher"
                                    : "Tout décocher"}
                            </CheckableTag>
                            <Divider type="vertical"/>
                            Données sélectionnées: {Object.keys(this.props.selectedDatasources).length}
                        </div>
                        {this.props.massEditionWarning &&
                            <Alert
                                style={{marginTop: "24px"}}
                                message={this.props.massEditionWarning}
                                type="warning"
                            />
                        }
                    </div>
                }
            </div>
        )
    }
}

export default MassEdition;
