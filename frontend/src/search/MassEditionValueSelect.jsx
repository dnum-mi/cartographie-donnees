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

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.selectedMassEditionField!== this.props.selectedMassEditionField) {

        }
    }


    render() {
        if (!!this.props.selectedMassEditionField) {
            let valueSelect = null
            if (this.props.selectedMassEditionField === "application") {
                valueSelect = <ApplicationSelect limited={false}/>
            } else if (["origin_applications", "reutilizations"].includes(this.props.selectedMassEditionField)) {
                valueSelect = <ApplicationSelect mode={"multiple"}
                                                 limited={false}/>
            } else {
                const config = attributes[this.props.selectedMassEditionField] || attributes["application"][this.props.selectedMassEditionField]
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
            return (
                <Form.Item name="massEditionValues">
                    {valueSelect}
                </Form.Item>
            )
        }
        return null
    }
}

export default MassEditionValueSelect;
