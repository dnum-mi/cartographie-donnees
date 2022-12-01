import React from "react";
import {Form, Select} from "antd";
import attributes from "../data-source/attributes";
import "./MassEdition.css"
import EnumSelect from "../components/EnumSelect";
import ApplicationSelect from "../data-source/ApplicationSelect";

class MassEditionValueSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let valueSelect = <Select disabled/>
        let is_required = false
        if (!!this.props.selectedMassEditionField) {
            if (this.props.selectedMassEditionField === "application") {
                valueSelect = <ApplicationSelect limited={false}/>
                is_required = true
            } else if (["origin_applications", "reutilizations"].includes(this.props.selectedMassEditionField)) {
                valueSelect = <ApplicationSelect mode={"multiple"}
                                                 limited={false}/>
            } else {
                const config = attributes[this.props.selectedMassEditionField] || attributes["application"][this.props.selectedMassEditionField]
                is_required = config.required
                if (config.type === "boolean") {
                    valueSelect = <Select options={[{label: "Vrai", value: true}, {label: "Faux", value: false}]}
                                          placeholder="Valeur du champ"/>
                } else if (config.type === "tag") {
                    valueSelect = <EnumSelect category={config.tagCategory}
                                              mode={config.tagMode === 'multiple' ? 'multiple' : null}/>
                } else {
                    console.error("Field not found in attributes:", this.props.selectedMassEditionField)
                }
            }
        }
        return (
            <Form.Item name="massEditionValues"
                       className={this.props.className}
                       rules={[{
                           required: is_required,
                           message: "Merci de renseigner une valeur non nul pour ce champ"
                       }]}>
                {valueSelect}
            </Form.Item>
        )
    }
}

export default MassEditionValueSelect;
