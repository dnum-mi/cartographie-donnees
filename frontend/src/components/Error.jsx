import { Alert } from "antd";
import React from "react";
import './Error.css';

export default function Error({ error }) {
    if (error.response) {
        // A description was sent in the response body from the backend
        return (
            <div className="Error">
                <Alert
                    message={error.response.data.description}
                    type="error"
                />
            </div>
        );
    }
    return (
        <div className="Error">
            <Alert
                message="Un problème est survenu"
                description={error.message}
                type="error"
            />
        </div>
    );
}
