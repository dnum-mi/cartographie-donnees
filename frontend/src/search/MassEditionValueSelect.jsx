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
                is_required = config.required
                if (config.type === "boolean") {
                    valueSelect = <Select
                        options={[
                            !config.required && {label: "-", value: null},
                            {label: "Vrai", value: true},
                            {label: "Faux", value: false},
                        ]}
                        placeholder="Valeur du champ"/>
                } else if (config.type === "tag") {
                    valueSelect = <EnumSelect
                        category={config.tagCategory}
                        defaultValue={config.tagMode === 'multiple' ? [] : null}
                        mode={config.tagMode === 'multiple' ? 'multiple' : null}
                        required={config.required}
                    />
                    is_multiple = config.tagMode === 'multiple'
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
                                   message: "Merci de renseigner une valeur non nulle pour ce champ"
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
                               message: "Merci de renseigner une valeur non nulle  pour ce champ"
                           }]}>
                    {valueSelect}
                </Form.Item>
            </div>
        )
    }
}

export default MassEditionValueSelect;
