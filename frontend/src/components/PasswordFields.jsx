import { Form, Input } from "antd";


export default function PasswordFields({isNewUser, passwordConfirmationRequired}) {
    return (
        <>
            <Form.Item
                label={isNewUser ? "Mot de passe" : "Nouveau mot de passe"}
                name="password"
                hasFeedback
                rules={[{
                    required: isNewUser,
                    type: 'string',
                    min: 8,
                    message: 'Le mot de passe doit contenir 8 caractères',
                }]}
            >
                <Input.Password/>
            </Form.Item>
            <Form.Item
                label="Confirmation de mot de passe"
                name="confirm_password"
                dependencies={['password']}
                hasFeedback
                rules={[{
                    required: isNewUser || passwordConfirmationRequired,
                    type: 'string',
                    min: 8,
                    message: 'Merci de confirmer votre mot de passe',
                }, ({ getFieldValue }) => ({
                    validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('Le mot de passe et sa confirmation ne sont pas identiques'));
                    },
                }),]}
            >
                <Input.Password/>
            </Form.Item>
        </>
    )
}
