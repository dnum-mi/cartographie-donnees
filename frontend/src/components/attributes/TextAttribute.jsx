import React from "react";
import {Form, Input, InputNumber, Spin, Typography} from "antd";
import {commonPropTypes, textPropTypes} from "./attributePropTypes";
import {commonDefaultProps, textDefaultProps} from "./attributeDefaultProps";
import {QuestionCircleOutlined} from "@ant-design/icons";
import withCurrentUser from "../../hoc/user/withCurrentUser";
import withTooltips from "../../hoc/tooltips/withTooltips";

const {Title} = Typography;
const {TextArea} = Input;


class TextAttribute extends React.Component {

    suffixElement() {
        return (
            <span className="attribute-suffix-value">
        ({this.props.suffixValue})
      </span>
        );
    }

    suffixInput() {
        return (
            <div className="attribute">
                <label
                    htmlFor={this.props.suffixAttributeId}
                    className="attribute-label"
                >
                    {this.props.suffixAttributeLabel}
                    <QuestionCircleOutlined
                        className="attribute-tooltip"
                        title={this.props.tooltips.get(this.props.suffixAttributeId)}
                    />
                </label>
                <Form.Item name={this.props.suffixAttributeId} initialValue={this.props.suffixValue}
                           rules={this.rules()}>
                    <Input
                        id={this.props.suffixAttributeId}
                        type="text"
                        placeholder={this.props.suffixEditionPlaceholder}
                        className="attribute-input"
                    />
                </Form.Item>
            </div>
        );
    }

    attributeInputClassName() {
        return this.props.headingLevel ?
            `attribute-input attribute-input-h${this.props.headingLevel}` :
            'attribute-input';
    }

    readElement() {
        const textValue = this.props.value || '-';
        if (this.props.headingLevel) {
            return (
                <Title level={this.props.headingLevel}>
                    {textValue}
                    {this.props.suffixValue ? this.suffixElement() : null}
                </Title>
            )
        } else if (this.props.isLink && this.props.value) {
            return (
                <a href={textValue} target="_blank" rel="noreferrer">{textValue}</a>
            )
        } else if (this.props.isMail && this.props.value) {
            return (
                <a href={"mailto:" + textValue}>{textValue}</a>
            )
        }
        return (
            <div style={{"whiteSpace": "pre-line", "wordBreak": "normal", "overflowWrap": "anywhere"}}>
                {
                    isNaN(textValue)
                        ? textValue
                        : new Intl.NumberFormat(
                            'fr-FR',
                            {
                                maximumSignificantDigits: this.props.attributeId === "application_historic"
                                    ? 4
                                    : 3,
                                useGrouping: !(this.props.attributeId === "application_historic")
                            }).format(textValue)
                }
                {this.props.suffixValue ? this.suffixElement() : null}
            </div>
        )
    }

    rules = () => {
        if (this.props.noRules) {
            return undefined
        }
        if (this.props.isLink) {
            return [{
                required: !!this.props.required,
                type: "url"
            }]
        } else if (this.props.isMail) {
            return [{
                required: !!this.props.required,
                type: "email"
            }]
        } else if (this.props.attributeId === "application_historic") {
            let min_value = 1950;
            let max_value = 2050;
            return [{
                validator: (_, value) => {
                    if (value === null){
                        if (!!this.props.required){
                            Promise.reject(new Error('Ce champ est requis!'))
                        }
                        return Promise.resolve()
                    }
                    if (value < min_value || value > max_value) {
                        return Promise.reject(new Error('Veuillez sélectionner un nombre entre 1950 et l\'année en cours'))
                    }
                    return Promise.resolve()
                },
            }]

        } else if (this.props.attributeId === "highlights_index") {
            let min_value = 1;
            let max_value = 10;
            return [{
                validator: (_, value) => {
                    if (value === null){
                        if (!!this.props.required){
                            Promise.reject(new Error('Ce champ est requis!'))
                        }
                        return Promise.resolve()
                    }
                    if (value < min_value || value > max_value) {
                        return Promise.reject(new Error('Veuillez sélectionner un nombre entre 1 et 10'))
                    }
                    return Promise.resolve()
                },
            }]
        } else {
            return [{
                required: !!this.props.required,
            }]
        }
    }

    writeElement() {
        let input;
        const mustAwaitApplicationSelection = !!this.props.textEditDisabledIfApplicationNotSelected &&
            (
                this.props.currentUser?.user?.is_admin
                    ? !(this.props.applicationIsSelected || this.props.applicationCreationMode)
                    : !this.props.applicationIsSelected
            )
        const spinning = !!this.props.textEditDisabledIfApplicationNotSelected && !!this.props.applicationSimulatedLoading
        if (this.props.isTextArea) {
            input = (
                <TextArea
                    id={this.props.attributeId}
                    placeholder={
                        mustAwaitApplicationSelection
                            ? "Veuillez sélectionner une application"
                            : this.props.editionPlaceholder
                    }
                    className={this.attributeInputClassName()}
                    disabled={mustAwaitApplicationSelection}
                />
            );
        } else if (this.props.inputType === "number") {
            input = (
                <InputNumber
                    id={this.props.attributeId}
                    placeholder={this.props.editionPlaceholder}
                    className={this.attributeInputClassName()}
                    min={0}
                    size="small"
                />
            );
        } else {
            input = (
                <Input
                    id={this.props.attributeId}
                    placeholder={this.props.editionPlaceholder}
                    className={this.attributeInputClassName()}
                />
            );
        }

        return (
            <div className="attribute-input-container">
                <Spin spinning={spinning}>
                    <Form.Item name={this.props.attributeId} initialValue={this.props.value} rules={this.rules()}>
                        {input}
                    </Form.Item>
                    {this.props.hasSuffixValue ? this.suffixInput() : null}
                </Spin>
            </div>
        )
    }

    render() {
        if (this.props.editMode && !this.props.readOnly) {
            return this.writeElement();
        } else {
            return (
                <div className="attribute-value">
                    {this.readElement()}
                </div>
            );
        }
    }
}

TextAttribute.defaultProps = {
    ...commonDefaultProps,
    ...textDefaultProps,
}

TextAttribute.propTypes = {
    ...commonPropTypes,
    ...textPropTypes,
};

export default withCurrentUser(withTooltips(TextAttribute));
