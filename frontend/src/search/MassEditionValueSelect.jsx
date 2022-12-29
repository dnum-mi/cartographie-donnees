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
        let is_multiple = false
        let is_required = false
        if (!!this.props.selectedMassEditionField) {
            if (this.props.selectedMassEditionField === "application") {
                is_required = true
                valueSelect = <ApplicationSelect limited={false}/>
            } else if (["origin_applications", "reutilizations"].includes(this.props.selectedMassEditionField)) {
                is_required = false
                is_multiple = true
                valueSelect = <ApplicationSelect mode={"multiple"}
                                                 limited={false}/>
            } else {
                const config = attributes[this.props.selectedMassEditionField] || attributes["application"][this.props.selectedMassEditionField]
                if (config.type === "boolean") {
                    is_required = config.required
                    valueSelect = <Select
                        options={[
                            !config.required && {label: "-", value: null},
                            {label: "Vrai", value: true},
                            {label: "Faux", value: false},
                        ]}
                        placeholder="Valeur du champ"/>
                } else if (config.type === "tag") {
                    if (config.tagMode === 'multiple'){
                        is_multiple = true
                        is_required = true
                        valueSelect = <EnumSelect
                            category={config.tagCategory}
                            inivitalValue={[]}
                            mode={'multiple'}
                            required={config.required}
                        />
                    } else {
                        is_required = config.required
                        valueSelect = <EnumSelect
                            category={config.tagCategory}
                            required={config.required}
                        />
                    }
                } else {
                    console.error("Field not found in attributes:", this.props.selectedMassEditionField)
                }
            }
        }
        return (
            <div className={"mass-edition-value-select"}>
                {is_multiple &&
                    <Form.Item name="massEditionAddOrRemove"
                               className={"value-select"}
                               rules={[{
                                   required: true,
                                   message: "Merci de renseigner une valeur non nulle"
                               }]}>
                        <Select
                            options={[
                                {label: "Ajouter", value: true},
                                {label: "Supprimer", value: false},
                            ]}
                            placeholder="Ajouter/supprimer"/>
                    </Form.Item>}
                <Form.Item name="massEditionValues"
                           className={"value-select"}
                           rules={[{
                               required: is_required,
                               message: "Merci de renseigner une valeur non nulle"
                           }]}>
                    {valueSelect}
                </Form.Item>
            </div>
        )
    }
}

export default MassEditionValueSelect;
