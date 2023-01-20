import React from "react";
import { Form, Input } from "antd";

export default class EmailField extends React.Component {

    render () {
        return (
            <Form.Item
                label="Adresse email"
                name={this.props.name}
                tooltip={this.props.tooltip}
                rules={[
                    {
                        required: this.props.required,
                        message: 'Merci de renseigner l\'email de l\'administrateur',
                        validateTrigger: 'onBlur',
                    },
                    {
                        type: 'email',
                        message: 'Merci de renseigner une adresse email valide',
                        validateTrigger: 'onBlur',
                    },
                ]}
            >
                <Input type="email" aria-describedby="emailHelp" data-test="email" />
            </Form.Item>
        )
    }

}
